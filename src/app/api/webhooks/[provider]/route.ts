import { NextResponse } from "next/server";
import { providerByName } from "@/lib/payments";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { BRAND, SITE_URL } from "@/lib/brand";

/** Signature verification needs the exact bytes, so the body is read raw. */
export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: name } = await context.params;
  const provider = providerByName(name);
  if (!provider) {
    return NextResponse.json({ error: "unknown provider" }, { status: 404 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("stripe-signature") ??
    request.headers.get("x-paystack-signature") ??
    request.headers.get("verif-hash");

  const event = await provider.verifyWebhook(rawBody, signature);
  if (!event) {
    // Unsigned, forged, or an event type we do not act on. Same answer to all
    // three, so a prober learns nothing from the response.
    return NextResponse.json({ received: true }, { status: 202 });
  }

  if (!supabaseConfigured()) {
    return NextResponse.json({ received: true });
  }

  const db = createAdminClient();

  // Read before writing. The pending row records what we asked the customer to
  // pay, and it is the only thing that can catch a payment that succeeded for
  // the wrong amount or in the wrong currency.
  const { data: existing } = await db
    .from("payments")
    .select("id, user_id, email, amount_minor, currency, status")
    .eq("provider", provider.name)
    .eq("provider_reference", event.reference)
    .maybeSingle();

  if (!existing) {
    // No pending row: a reference we never issued. Nothing to reconcile.
    return NextResponse.json({ received: true }, { status: 202 });
  }

  // A webhook is a hint, never an instruction. If what was actually paid does
  // not match what was quoted, the payment does not become succeeded — it is
  // parked for a person to look at.
  const mismatched =
    event.status === "succeeded" &&
    (event.amountMinor !== existing.amount_minor ||
      event.currency !== existing.currency);

  if (mismatched) {
    console.error("[webhook] amount mismatch", {
      reference: event.reference,
      quoted: `${existing.amount_minor} ${existing.currency}`,
      paid: `${event.amountMinor} ${event.currency}`,
    });

    await db
      .from("payments")
      .update({
        status: "failed",
        failure_reason: `Amount mismatch: quoted ${existing.amount_minor} ${existing.currency}, received ${event.amountMinor} ${event.currency}`,
        raw_event: event.raw as never,
      })
      .eq("id", existing.id);

    await db.from("audit_logs").insert({
      action: "payment.amount_mismatch",
      subject_table: "payments",
      subject_id: existing.id,
      subject_user_id: existing.user_id,
      detail: {
        quoted_minor: existing.amount_minor,
        paid_minor: event.amountMinor,
        quoted_currency: existing.currency,
        paid_currency: event.currency,
      },
    });

    return NextResponse.json({ received: true });
  }

  // Providers retry. Doing the work twice would send a second receipt and a
  // second notification, so a row that already succeeded is left alone.
  const alreadySettled = existing.status === "succeeded";

  const { data: payment } = await db
    .from("payments")
    .update({
      status: event.status === "succeeded" ? "succeeded" : "failed",
      paid_at: event.status === "succeeded" ? new Date().toISOString() : null,
      raw_event: event.raw as never,
    })
    .eq("id", existing.id)
    .select("id, user_id, email, amount_minor, currency")
    .maybeSingle();

  if (event.status === "succeeded" && !alreadySettled) {
    const to = payment?.email ?? event.email;
    if (to) {
      await sendEmail({
        to,
        subject: `Your ${BRAND} programme is confirmed`,
        heading: "That is confirmed.",
        body: [
          "Your payment has gone through and your place is held.",
          "A coach will be in touch within one working day to arrange your first session. If you have already taken the assessment, they will have read your readiness map before you speak.",
        ],
        cta: { label: "Go to your account", href: `${SITE_URL}/account` },
      });
    }

    if (payment?.user_id) {
      await db.from("notifications").insert({
        user_id: payment.user_id,
        kind: "payment_succeeded",
        title: "Payment confirmed",
        body: "Your programme is confirmed. A coach will be in touch within one working day.",
        href: "/account",
      });
    }
  }

  return NextResponse.json({ received: true });
}
