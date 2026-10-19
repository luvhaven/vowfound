import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/flutterwave";
import { sendEmail, staffInbox } from "@/lib/email";
import { productBySlug, priceFor, toMinor, type Currency } from "@/lib/products";

const CREDIT_DAYS = 30;

/**
 * What this buyer owes for a product, after The Read credit: anyone who paid
 * for The Read in the last thirty days has that amount taken off Ready or
 * Matched, in the same currency. Computed on the server at charge time.
 */
export async function amountDue(slug: string, currency: Currency, email: string) {
  const product = productBySlug(slug);
  if (!product) throw new Error("unknown product");
  const full = priceFor(product, currency);
  if (slug !== "ready" && slug !== "matched") return { amount: full, credit: 0 };

  const since = new Date(Date.now() - CREDIT_DAYS * 86_400_000).toISOString();
  const { data } = await createAdminClient()
    .from("orders")
    .select("amount_minor")
    .eq("product", "the-read")
    .eq("status", "paid")
    .eq("currency", currency)
    .ilike("email", email)
    .gte("paid_at", since)
    .limit(1);

  const credit = data?.[0] ? Number(data[0].amount_minor) / 100 : 0;
  return { amount: Math.max(full - credit, 0), credit };
}

/**
 * Marks an order paid only after Flutterwave itself confirms a successful
 * transaction for the same reference, amount and currency. Safe to call more
 * than once: the redirect and the webhook both arrive, and the second is a
 * no-op.
 */
export async function settleOrder(txRef: string, transactionId: string | number) {
  const db = createAdminClient();
  const { data: order } = await db.from("orders").select("*").eq("tx_ref", txRef).maybeSingle();
  if (!order) return { ok: false as const, reason: "no_order" };
  if (order.status === "paid") return { ok: true as const, order };

  const tx = await verifyTransaction(transactionId);
  const matches =
    tx.status === "successful" &&
    tx.tx_ref === txRef &&
    tx.currency === order.currency &&
    toMinor(tx.amount) >= Number(order.amount_minor);

  if (!matches) {
    if (tx.status === "failed") await db.from("orders").update({ status: "failed" }).eq("id", order.id);
    return { ok: false as const, reason: "not_successful" };
  }

  const { data: updated } = await db
    .from("orders")
    .update({ status: "paid", provider_tx_id: String(tx.id), paid_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (updated) {
    const product = productBySlug(order.product);
    await sendEmail(
      order.email,
      `You're in: ${product?.name ?? "VowFound"}`,
      `Thank you — your payment for ${product?.name} is confirmed.\n\nA member of the VowFound team will email you personally to book your first session.\n\nReference: ${txRef}\n\n— VowFound`,
    );
    await sendEmail(staffInbox(), `New order: ${product?.name}`, `${order.email} paid ${order.currency} ${Number(order.amount_minor) / 100} (${txRef}).`);
  }
  return { ok: true as const, order: updated ?? order };
}
