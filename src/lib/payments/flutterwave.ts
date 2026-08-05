import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  VerifiedEvent,
} from "./types";
import type { Currency } from "@/lib/products";

const API = "https://api.flutterwave.com/v3";

/**
 * Flutterwave collects in NGN and USD from one integration, and carries the
 * Nigerian bank-transfer rails that matter at these prices — a ₦450,000
 * programme is not a card transaction, and Nigerian cards routinely cannot
 * clear a USD one at all.
 *
 * Two things about this integration are load-bearing:
 *
 * 1. Amounts are in MAJOR units here, unlike Stripe and Paystack. The rest of
 *    the application speaks minor units, so the conversion happens at this
 *    boundary and nowhere else.
 *
 * 2. The webhook signature is a shared secret compared verbatim — it proves
 *    the request came from Flutterwave, but it says nothing about the body.
 *    A valid hash on a tampered payload still verifies. So a webhook is only
 *    ever a hint that something happened; the amount, currency and status are
 *    then re-read from Flutterwave's own API before a payment is marked paid.
 */

function secret(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not set");
  return key;
}

/** Flutterwave quotes major units; the rest of the app stores minor. */
function toMajor(amountMinor: number): number {
  return amountMinor / 100;
}
function toMinor(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

interface VerifyPayload {
  status: string;
  data?: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    customer?: { email?: string };
  };
}

/** Re-reads a transaction from Flutterwave. The only trusted source of truth. */
async function verifyTransaction(id: string | number): Promise<VerifyPayload | null> {
  try {
    const response = await fetch(`${API}/transactions/${id}/verify`, {
      headers: { Authorization: `Bearer ${secret()}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as VerifyPayload;
  } catch (error) {
    console.error("[flutterwave] verify failed", error);
    return null;
  }
}

export const flutterwaveProvider: PaymentProvider = {
  name: "flutterwave",
  // Handles both currencies, so the router picks it for either.
  currency: "NGN",

  isConfigured() {
    return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
  },

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    // Our own reference, so a payment can be reconciled even if Flutterwave's
    // id never reaches us.
    const reference = `vf-${request.productSlug}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    // Bank transfer first: at these amounts it is the method most people can
    // actually complete, and card limits are the usual reason a sale fails.
    const options =
      request.currency === "NGN"
        ? "banktransfer,card,ussd,account"
        : "card,banktransfer";

    const response = await fetch(`${API}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: reference,
        amount: toMajor(request.amountMinor),
        currency: request.currency,
        redirect_url: request.successUrl,
        payment_options: options,
        customer: { email: request.email },
        customizations: {
          title: "VowFound",
          description: request.productName,
        },
        meta: {
          product_slug: request.productSlug,
          user_id: request.userId ?? null,
          cancel_url: request.cancelUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Flutterwave initialise failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      status: string;
      data?: { link: string };
    };

    if (payload.status !== "success" || !payload.data?.link) {
      throw new Error("Flutterwave returned no payment link");
    }

    return { url: payload.data.link, reference };
  },

  async verifyWebhook(
    rawBody: string,
    signature: string | null,
  ): Promise<VerifiedEvent | null> {
    const expected = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!expected || !signature) return null;

    // Hashed before comparing so the two sides are always equal length —
    // timingSafeEqual throws on a length mismatch, and that throw would itself
    // leak the length of the real secret.
    const a = createHash("sha256").update(expected).digest();
    const b = createHash("sha256").update(signature).digest();
    if (!timingSafeEqual(a, b)) return null;

    let event: {
      event?: string;
      data?: { id?: number; tx_ref?: string; status?: string };
    };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return null;
    }

    const id = event.data?.id;
    const reference = event.data?.tx_ref;
    if (!id || !reference) return null;

    // The payload is not trusted for anything financial. Re-read it.
    const verified = await verifyTransaction(id);
    const data = verified?.data;

    if (!data || data.tx_ref !== reference) {
      // Either Flutterwave does not recognise the transaction, or the body
      // referenced one that belongs to a different reference.
      return null;
    }

    const succeeded =
      verified.status === "success" && data.status === "successful";

    return {
      reference,
      status: succeeded ? "succeeded" : "failed",
      amountMinor: toMinor(data.amount),
      currency: data.currency as Currency,
      email: data.customer?.email ?? null,
      raw: verified,
    };
  },
};

/**
 * Confirms a transaction on return from the payment page, so the confirmation
 * screen can tell the truth immediately rather than waiting on a webhook that
 * may be seconds behind.
 */
export async function confirmFlutterwaveRedirect(
  transactionId: string,
  expectedReference: string,
): Promise<VerifiedEvent | null> {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) return null;

  const verified = await verifyTransaction(transactionId);
  const data = verified?.data;
  if (!data || data.tx_ref !== expectedReference) return null;

  return {
    reference: data.tx_ref,
    status:
      verified.status === "success" && data.status === "successful"
        ? "succeeded"
        : "failed",
    amountMinor: toMinor(data.amount),
    currency: data.currency as Currency,
    email: data.customer?.email ?? null,
    raw: verified,
  };
}
