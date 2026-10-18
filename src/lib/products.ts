export type Currency = "NGN" | "USD";

/**
 * The two prices are independent, not converted. Naira pricing reflects what
 * the work is worth in that economy, which is why ₦75,000 is not ₦200,000 —
 * it is a local price, deliberately set.
 *
 * How the October 2026 fees were set:
 *  - Clarity Audit: an hour of a qualified coach plus a written map is
 *    roughly two hours of skilled time. $79 did not cover it, and a price that
 *    cannot pay the coach quietly becomes a sales call. $129 can.
 *  - Ready in 90: six one-to-ones alone are $900+ at market coaching rates;
 *    twelve cohort sessions and written feedback sit on top. About $112 a week.
 *  - Match: boutique matchmaking commonly starts at $5,000–$15,000 for the
 *    search alone. Nine months of a named matchmaker plus the full programme
 *    at $4,500 is deliberately below that, about $115 a week.
 *  - Concierge: hands-on principal time, travel and discreet outreach; capped
 *    cohort, application only.
 *
 * That only holds if the local price stays local. Which currency a person may
 * buy in is decided server-side from their region, never from a cookie or a
 * form field, and is re-checked at the moment of charge.
 */
export interface Product {
  slug: string;
  name: string;
  shape: string;
  summary: string;
  price: Record<Currency, number>;
  includes: readonly string[];
  applicationOnly?: boolean;
  /** Length of the engagement, so a fee can be read as a weekly cost. Null
   *  where the work is a single sitting or open-ended. */
  weeks: number | null;
  /** Used by the readiness map to recommend a starting point. */
  band: "audit" | "programme" | "match" | "concierge";
}

export const PRODUCTS: readonly Product[] = [
  {
    slug: "clarity-audit",
    name: "The Clarity Audit",
    shape: "Assessment, a 60-minute diagnostic, and a written readiness map",
    summary:
      "The honest reading. What is working, what is in the way, and what to do first.",
    price: { NGN: 75_000, USD: 129 },
    weeks: null,
    band: "audit",
    includes: [
      "The full readiness assessment",
      "A 60-minute diagnostic call with a coach",
      "Your written readiness map",
      "One first action per obstacle",
    ],
  },
  {
    slug: "ready-in-90",
    name: "Ready in 90",
    shape: "A 90-day readiness programme, group work plus fortnightly one-to-one",
    summary:
      "For people who want to understand recurring patterns and practise the skills a committed partnership needs.",
    price: { NGN: 495_000, USD: 1_450 },
    weeks: 13,
    band: "programme",
    includes: [
      "Everything in the Clarity Audit",
      "Six fortnightly one-to-one sessions",
      "Weekly group work with a small cohort",
      "Exercises with written feedback",
      "Honest feedback on how you present",
    ],
  },
  {
    slug: "match",
    name: "VowFound Match",
    shape: "The readiness programme plus curated introductions, nine months",
    summary:
      "Readiness first, then a search run by a person who can explain every name they send you.",
    price: { NGN: 1_650_000, USD: 4_500 },
    weeks: 39,
    band: "match",
    includes: [
      "Everything in Ready in 90",
      "Verification and a private matchmaking profile",
      "An assigned matchmaker for nine months",
      "An agreed number of qualified introductions",
      "A structured debrief after every meeting",
    ],
  },
  {
    slug: "private-concierge",
    name: "VowFound Private Concierge",
    shape: "Private, hands-on, application only, capped cohort",
    summary:
      "For clients whose situation is unusual, public, or complicated enough that a standard search will not work.",
    price: { NGN: 4_750_000, USD: 12_500 },
    weeks: null,
    band: "concierge",
    applicationOnly: true,
    includes: [
      "Everything in VowFound Match",
      "A named principal on your search",
      "Off-platform, discreet outreach",
      "Direct scheduling and travel coordination",
      "A strictly capped cohort, so places are genuinely limited",
    ],
  },
] as const;

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** The only way a price should be read. */
export function priceFor(product: Product, currency: Currency): number {
  return product.price[currency];
}

/**
 * Which currencies a region may transact in.
 *
 * Naira is available to Nigeria only. Everywhere else pays in dollars and has
 * no switcher at all, because the naira price is a local price rather than a
 * discount anyone may opt into.
 *
 * Nigeria keeps both: plenty of clients hold dollar cards, and offering only
 * naira would strand them.
 */
export function allowedCurrencies(countryCode: string | null): Currency[] {
  return countryCode?.toUpperCase() === "NG" ? ["NGN", "USD"] : ["USD"];
}

export function isCurrencyAllowed(
  currency: Currency,
  countryCode: string | null,
): boolean {
  return allowedCurrencies(countryCode).includes(currency);
}

/* Never render both currencies on the same screen. */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export const CURRENCY_COOKIE = "vf_currency";

/** NGN routes to Paystack, USD routes to Stripe. */
export function providerForCurrency(currency: Currency): "paystack" | "stripe" {
  return currency === "NGN" ? "paystack" : "stripe";
}
