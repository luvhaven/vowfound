import type { Currency } from "@/lib/products";

export interface CheckoutRequest {
  productSlug: string;
  productName: string;
  /** Minor units: kobo for NGN, cents for USD. */
  amountMinor: number;
  currency: Currency;
  email: string;
  userId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  /** Where to send the customer to pay. */
  url: string;
  /** Our handle on the attempt, stored on the payment row. */
  reference: string;
}

export interface VerifiedEvent {
  reference: string;
  status: "succeeded" | "failed" | "pending";
  amountMinor: number;
  currency: Currency;
  email: string | null;
  raw: unknown;
}

/**
 * A third provider is a new file implementing this interface and one line in
 * providerFor(). Nothing else in the application changes.
 */
export interface PaymentProvider {
  readonly name: "stripe" | "paystack";
  readonly currency: Currency;
  isConfigured(): boolean;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  /** Verifies the signature and returns the event, or null if it is not ours. */
  verifyWebhook(rawBody: string, signature: string | null): Promise<VerifiedEvent | null>;
}
