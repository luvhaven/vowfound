import "server-only";
import type { Currency } from "@/lib/products";
import type { PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";
import { paystackProvider } from "./paystack";
import { flutterwaveProvider } from "./flutterwave";

/**
 * Flutterwave collects both currencies, so it is the default for both. Stripe
 * and Paystack stay implemented and selectable: if a provider suspends an
 * account or an outage takes one down, switching is an environment variable
 * rather than a deploy.
 *
 * PAYMENT_PROVIDER_NGN / PAYMENT_PROVIDER_USD override the default per
 * currency. Anything unrecognised falls back to Flutterwave rather than
 * throwing, because a typo in an env var should not take checkout offline.
 */
const DEFAULTS: Record<Currency, string> = {
  NGN: "flutterwave",
  USD: "flutterwave",
};

export function providerFor(currency: Currency): PaymentProvider {
  const configured =
    currency === "NGN"
      ? process.env.PAYMENT_PROVIDER_NGN
      : process.env.PAYMENT_PROVIDER_USD;

  return (
    providerByName(configured ?? "") ??
    providerByName(DEFAULTS[currency]) ??
    flutterwaveProvider
  );
}

export function providerByName(name: string): PaymentProvider | null {
  if (name === "stripe") return stripeProvider;
  if (name === "paystack") return paystackProvider;
  if (name === "flutterwave") return flutterwaveProvider;
  return null;
}

/** Minor units. NGN is billed in kobo, USD in cents. */
export function toMinorUnits(amount: number, currency: Currency): number {
  return currency === "NGN" ? amount * 100 : amount * 100;
}

export type { PaymentProvider } from "./types";
export { confirmFlutterwaveRedirect } from "./flutterwave";
