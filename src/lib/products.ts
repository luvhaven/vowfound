export type Currency = "NGN" | "USD";

/**
 * The offer. Five steps, each the smallest useful next one.
 *
 * Fees are set per economy rather than converted: the naira price is a local
 * price, available to buyers in Nigeria only, and the server re-checks region
 * at the moment of charge.
 *
 * Why these numbers:
 *  - The Read ($49): a written report plus 30 minutes with a coach is about an
 *    hour of skilled time. Priced to be an easy yes, and to pay the coach.
 *  - Ready ($1,200, 12 weeks): six one-to-ones alone are $900+ at market
 *    coaching rates; cohort sessions and written feedback sit on top. ~$100/wk.
 *  - Matched ($3,900, 6 months): boutique matchmaking commonly starts at
 *    $5,000–$15,000 for the search alone. This includes the coaching. ~$150/wk.
 *  - Private (from $15,000, 12 months): principal-led, discreet, capped.
 */
export interface Product {
  slug: string;
  name: string;
  /** One line, said the way a friend would describe it. */
  hook: string;
  forWho: string;
  price: Record<Currency, number>;
  weeks: number | null;
  includes: readonly string[];
  applicationOnly?: boolean;
  colour: "butter" | "bubble" | "cobalt" | "tomato" | "moss";
}

export const PRODUCTS: readonly Product[] = [
  {
    slug: "the-read",
    name: "The Read",
    hook: "Your readiness report, read with you by a real coach.",
    forWho: "You want an honest second opinion before you spend real money.",
    price: { NGN: 25_000, USD: 49 },
    weeks: null,
    colour: "butter",
    includes: [
      "Your full written readiness report",
      "A 30-minute video call with a coach",
      "Your top three moves, in writing",
      "Credit toward Ready or Matched if you continue within 30 days",
    ],
  },
  {
    slug: "ready",
    name: "Ready",
    hook: "Twelve weeks of coaching for the person you'll be in a marriage.",
    forWho: "You keep meeting the wrong people, or keep leaving the right ones.",
    price: { NGN: 450_000, USD: 1_200 },
    weeks: 12,
    colour: "bubble",
    includes: [
      "Everything in The Read",
      "Six one-to-one coaching sessions",
      "Weekly small-group sessions (max 8 people)",
      "Exercises with written feedback",
      "A dating profile and story rewrite",
    ],
  },
  {
    slug: "matched",
    name: "Matched",
    hook: "Coaching plus a matchmaker who hand-picks every introduction.",
    forWho: "You're ready, and your pool isn't. You want people who want marriage.",
    price: { NGN: 1_450_000, USD: 3_900 },
    weeks: 26,
    colour: "cobalt",
    includes: [
      "Everything in Ready",
      "A verified, private profile nobody can browse",
      "A named matchmaker for six months",
      "Introductions with a written reason why",
      "A debrief after every date",
    ],
  },
  {
    slug: "private",
    name: "Private",
    hook: "A principal-led search for people who need total discretion.",
    forWho: "Public profile, complicated life, or a very specific brief.",
    price: { NGN: 6_000_000, USD: 15_000 },
    weeks: 52,
    colour: "tomato",
    applicationOnly: true,
    includes: [
      "Everything in Matched, for twelve months",
      "A named principal leading your search",
      "Discreet, off-platform outreach",
      "Travel and scheduling handled",
      "Strictly limited places",
    ],
  },
] as const;

export function productBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function priceFor(product: Product, currency: Currency) {
  return product.price[currency];
}

export function formatPrice(amount: number, currency: Currency) {
  return currency === "NGN" ? `₦${amount.toLocaleString("en-NG")}` : `$${amount.toLocaleString("en-US")}`;
}

export function toMinor(amount: number) {
  return Math.round(amount * 100);
}

/** Naira is a local price: Nigeria only. Nigeria may also pay in dollars. */
export function allowedCurrencies(country: string | null): Currency[] {
  return country?.toUpperCase() === "NG" ? ["NGN", "USD"] : ["USD"];
}

export const CURRENCY_COOKIE = "vf_currency";
