import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  VerifiedEvent,
} from "./types";

const API = "https://api.paystack.co";

export const paystackProvider: PaymentProvider = {
  name: "paystack",
  currency: "NGN",

  isConfigured() {
    return Boolean(process.env.PAYSTACK_SECRET_KEY);
  },

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");

    const response = await fetch(`${API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: request.email,
        amount: request.amountMinor, // kobo
        currency: "NGN",
        callback_url: request.successUrl,
        metadata: {
          product_slug: request.productSlug,
          product_name: request.productName,
          user_id: request.userId ?? null,
          cancel_action: request.cancelUrl,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Paystack initialise failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      status: boolean;
      data?: { authorization_url: string; reference: string };
    };

    if (!payload.status || !payload.data) {
      throw new Error("Paystack returned no authorisation URL");
    }

    return {
      url: payload.data.authorization_url,
      reference: payload.data.reference,
    };
  },

  async verifyWebhook(
    rawBody: string,
    signature: string | null,
  ): Promise<VerifiedEvent | null> {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key || !signature) return null;

    const expected = createHmac("sha512", key).update(rawBody).digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const event = JSON.parse(rawBody) as {
      event: string;
      data: {
        reference: string;
        status: string;
        amount: number;
        customer?: { email?: string };
      };
    };

    if (!event.event?.startsWith("charge.")) return null;

    return {
      reference: event.data.reference,
      status:
        event.event === "charge.success" && event.data.status === "success"
          ? "succeeded"
          : "failed",
      amountMinor: event.data.amount,
      currency: "NGN",
      email: event.data.customer?.email ?? null,
      raw: event,
    };
  },
};
