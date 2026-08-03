import "server-only";
import Stripe from "stripe";
import type {
  CheckoutRequest,
  CheckoutSession,
  PaymentProvider,
  VerifiedEvent,
} from "./types";

function client() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export const stripeProvider: PaymentProvider = {
  name: "stripe",
  currency: "USD",

  isConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const stripe = client();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: request.email,
      client_reference_id: request.userId,
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: request.amountMinor,
            product_data: { name: request.productName },
          },
        },
      ],
      metadata: {
        product_slug: request.productSlug,
        user_id: request.userId ?? "",
      },
    });

    if (!session.url) throw new Error("Stripe returned no checkout URL");

    return { url: session.url, reference: session.id };
  },

  async verifyWebhook(
    rawBody: string,
    signature: string | null,
  ): Promise<VerifiedEvent | null> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret || !signature) return null;

    let event: Stripe.Event;
    try {
      event = client().webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      // Bad signature. Treated as not ours rather than as an error, so a
      // forged request cannot distinguish itself from an unknown one.
      return null;
    }

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_failed"
    ) {
      return null;
    }

    const session = event.data.object as Stripe.Checkout.Session;

    return {
      reference: session.id,
      status:
        event.type === "checkout.session.completed" &&
        session.payment_status === "paid"
          ? "succeeded"
          : "failed",
      amountMinor: session.amount_total ?? 0,
      currency: "USD",
      email: session.customer_details?.email ?? session.customer_email ?? null,
      raw: event,
    };
  },
};
