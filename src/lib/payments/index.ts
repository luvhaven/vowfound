import "server-only";
import type { Currency } from "@/lib/products";
import type { PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";
import { paystackProvider } from "./paystack";

/** NGN routes to Paystack, USD routes to Stripe. */
export function providerFor(currency: Currency): PaymentProvider {
  return currency === "NGN" ? paystackProvider : stripeProvider;
}

export function providerByName(name: string): PaymentProvider | null {
  if (name === "stripe") return stripeProvider;
  if (name === "paystack") return paystackProvider;
  return null;
}

/** Minor units. NGN is billed in kobo, USD in cents. */
export function toMinorUnits(amount: number, currency: Currency): number {
  return currency === "NGN" ? amount * 100 : amount * 100;
}

export type { PaymentProvider } from "./types";
