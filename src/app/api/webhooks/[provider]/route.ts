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
    request.headers.get("x-paystack-signature");

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

  const { data: payment } = await db
    .from("payments")
    .update({
      status: event.status === "succeeded" ? "succeeded" : "failed",
      paid_at: event.status === "succeeded" ? new Date().toISOString() : null,
      raw_event: event.raw as never,
    })
    .eq("provider", provider.name)
    .eq("provider_reference", event.reference)
    .select("id, user_id, email, amount_minor, currency")
    .maybeSingle();

  if (event.status === "succeeded") {
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
