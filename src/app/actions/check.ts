"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { STATEMENTS, recommend, score } from "@/lib/readiness";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/brand";

const schema = z.object({
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  firstName: z.string().trim().max(80).optional(),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
});

/** Scores on the server (never trusts a client score) and stores the result. */
export async function saveCheck(input: unknown): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const known = new Set(STATEMENTS.map((s) => s.id));
  const answers = Object.fromEntries(Object.entries(parsed.data.answers).filter(([k]) => known.has(k)));
  if (Object.keys(answers).length < STATEMENTS.length) return { ok: false, error: "incomplete" };

  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(`check:${ip}`, 20, 3600)) return { ok: false, error: "rate_limited" };
  if (!adminConfigured()) return { ok: false, error: "not_configured" };

  const scores = score(answers);
  const recommended = recommend(scores);
  const user = await getUser().catch(() => null);
  const email = parsed.data.email || user?.email || null;

  const { data, error } = await createAdminClient()
    .from("readiness_checks")
    .insert({
      member_id: user?.id ?? null,
      email,
      first_name: parsed.data.firstName || null,
      answers,
      scores,
      recommended,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[check] insert failed", error);
    return { ok: false, error: "store_failed" };
  }

  if (email) {
    await sendEmail(
      email,
      "Your VowFound Readiness Check results",
      `Hi${parsed.data.firstName ? ` ${parsed.data.firstName}` : ""},\n\nYour results are here: ${SITE_URL}/results/${data.id}\n\nKeep this link private — anyone with it can see your results.\n\n— VowFound`,
    );
  }

  return { ok: true, id: data.id };
}

const emailSchema = z.object({
  id: z.string().uuid(),
  email: z.string().trim().email().max(320),
  firstName: z.string().trim().max(80).optional(),
});

export type EmailResultsState = { ok?: boolean; error?: string } | undefined;

/** For people who skipped the email step: attach an address to a check that
 *  has none, and send the private link. Never overwrites an existing email. */
export async function emailMyResults(_: EmailResultsState, form: FormData): Promise<EmailResultsState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter a valid email address." };
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(`email-results:${ip}`, 5, 3600)) return { error: "Too many attempts. Try again later." };
  if (!adminConfigured()) return { error: "Email isn't available right now." };

  const { data, error } = await createAdminClient()
    .from("readiness_checks")
    .update({ email: parsed.data.email, first_name: parsed.data.firstName || undefined })
    .eq("id", parsed.data.id)
    .is("email", null)
    .select("id")
    .maybeSingle();
  if (error || !data) return { error: "These results already have an email attached." };

  await sendEmail(
    parsed.data.email,
    "Your VowFound Readiness Check results",
    `Your results are here: ${SITE_URL}/results/${data.id}\n\nKeep this link private — anyone with it can see your results.\n\n— VowFound`,
  );
  return { ok: true };
}
