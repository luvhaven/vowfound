import { NextResponse } from "next/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { FOLLOWUP_DAYS, followupEmail } from "@/lib/followup";
import { SITE_URL } from "@/lib/brand";
import type { Scores } from "@/lib/readiness";

/**
 * Daily follow-up run (scheduled in vercel.json). Sends the next email in the
 * sequence to anyone who left an email, hasn't unsubscribed, and hasn't paid.
 * Protected by CRON_SECRET, which Vercel Cron sends as a bearer token.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!adminConfigured()) return NextResponse.json({ ok: false, reason: "not_configured" });

  const db = createAdminClient();
  const { data: checks } = await db
    .from("readiness_checks")
    .select("id, email, first_name, scores, recommended, followups_sent, created_at")
    .not("email", "is", null)
    .eq("unsubscribed", false)
    .lt("followups_sent", FOLLOWUP_DAYS.length)
    .gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString())
    .order("created_at", { ascending: true })
    .limit(200);

  let sent = 0;
  const seen = new Set<string>();

  for (const c of checks ?? []) {
    const email = String(c.email).toLowerCase();
    // One sequence per person: if they took the check twice, follow the latest.
    if (seen.has(email)) continue;
    seen.add(email);

    const due = new Date(c.created_at).getTime() + FOLLOWUP_DAYS[c.followups_sent] * 86_400_000;
    if (Date.now() < due) continue;

    const { count } = await db.from("orders").select("id", { count: "exact", head: true }).ilike("email", email).eq("status", "paid");
    if (count) {
      await db.from("readiness_checks").update({ followups_sent: FOLLOWUP_DAYS.length }).eq("id", c.id);
      continue;
    }

    const plan = c.followups_sent === FOLLOWUP_DAYS.length - 1 ? "the-read" : c.recommended;
    const message = followupEmail(c.followups_sent, {
      firstName: c.first_name,
      scores: c.scores as Scores,
      recommended: c.recommended,
      resultsUrl: `${SITE_URL}/results/${c.id}`,
      unsubscribeUrl: `${SITE_URL}/unsubscribe/${c.id}`,
      planUrl: `${SITE_URL}/checkout/${plan}`,
    });

    // Claim the step before sending, so an overlapping run can't double-send.
    const { data: claimed } = await db
      .from("readiness_checks")
      .update({ followups_sent: c.followups_sent + 1, last_followup_at: new Date().toISOString() })
      .eq("id", c.id)
      .eq("followups_sent", c.followups_sent)
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    await sendEmail(email, message.subject, message.text);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
