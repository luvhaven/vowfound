"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { getViewer, recordAudit } from "@/lib/admin.server";
import { productBySlug, type Currency } from "@/lib/products";
import { toMinorUnits } from "@/lib/payments";
import { sendEmail } from "@/lib/email";
import { BRAND, SITE_URL } from "@/lib/brand";

/**
 * Recording money that arrived by bank transfer.
 *
 * Concierge is ₦3,500,000 / $8,500. Nobody puts that on a debit card, and
 * Nigerian cards frequently cannot clear a USD charge of any size. The honest
 * options were to lose those sales or to keep them off the books; this is the
 * third one. An offline payment lands in the same ledger as a gateway payment,
 * so billing history, revenue and the audit log stay true.
 *
 * It is deliberately harder to create than a gateway payment: it names the
 * staff member who recorded it and demands a bank reference, because unlike a
 * webhook it carries no evidence of its own.
 */
const schema = z.object({
  email: z.string().email("Enter the payer's email address.").max(320),
  productSlug: z.string().min(1).max(64),
  currency: z.enum(["NGN", "USD"]),
  bankReference: z
    .string()
    .min(4, "Enter the reference from the bank statement.")
    .max(120),
  note: z.string().max(1000).optional(),
  /** Typed out in full, so this cannot be a mis-click. */
  confirmation: z.literal("RECORD PAYMENT", {
    message: "Type RECORD PAYMENT to confirm.",
  }),
});

export async function recordOfflinePayment(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Check the form.",
    };
  }

  if (!supabaseConfigured()) {
    return { ok: false as const, error: "The database is not connected." };
  }

  // Recording revenue is an administrator action, never a coach's.
  const viewer = await getViewer();
  if (!viewer?.isAdmin) {
    return { ok: false as const, error: "Not permitted." };
  }

  const product = productBySlug(parsed.data.productSlug);
  if (!product) {
    return { ok: false as const, error: "Unknown plan." };
  }

  const currency = parsed.data.currency as Currency;
  const amountMinor = toMinorUnits(product.price[currency], currency);
  const db = createAdminClient();

  // Attach it to the member's account where one exists, so it shows up in
  // their billing history rather than only in ours.
  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  const reference = `offline-${parsed.data.bankReference.trim()}`;

  const { data: payment, error } = await db
    .from("payments")
    .insert({
      user_id: profile?.id ?? null,
      provider: "offline",
      provider_reference: reference,
      status: "succeeded",
      currency,
      amount_minor: amountMinor,
      email: parsed.data.email,
      paid_at: new Date().toISOString(),
      recorded_by: viewer.id,
      recorded_note: parsed.data.note ?? null,
      bank_reference: parsed.data.bankReference.trim(),
      raw_event: {
        source: "offline",
        recorded_by_email: viewer.email,
        product: product.slug,
      },
    })
    .select("id")
    .maybeSingle();

  if (error) {
    // The unique index on (provider, provider_reference) is what stops the
    // same transfer being banked twice.
    if (error.code === "23505") {
      return {
        ok: false as const,
        error: "That bank reference has already been recorded.",
      };
    }
    console.error("[offline-payment] insert failed", error);
    return { ok: false as const, error: "Could not record that payment." };
  }

  await recordAudit({
    actorId: viewer.id,
    action: "payment.recorded_offline",
    subjectTable: "payments",
    subjectId: payment?.id,
    subjectUserId: profile?.id,
    detail: {
      product: product.slug,
      amount_minor: amountMinor,
      currency,
      bank_reference: parsed.data.bankReference.trim(),
    },
  });

  await sendEmail({
    to: parsed.data.email,
    subject: `Your ${BRAND} programme is confirmed`,
    heading: "That is confirmed.",
    body: [
      `We have received your transfer for ${product.name} and your place is held.`,
      "A coach will be in touch within one working day to arrange your first session.",
    ],
    cta: { label: "Go to your account", href: `${SITE_URL}/account` },
  });

  if (profile?.id) {
    await db.from("notifications").insert({
      user_id: profile.id,
      kind: "payment_succeeded",
      title: "Payment confirmed",
      body: "We have received your transfer. A coach will be in touch within one working day.",
      href: "/account",
    });
  }

  revalidatePath("/admin/payments");
  return { ok: true as const };
}
