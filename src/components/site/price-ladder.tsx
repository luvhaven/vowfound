import Link from "next/link";
import { PRODUCTS, priceFor, formatPrice, type Currency } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

/**
 * The four ways of working together, side by side, with the fee on every one.
 *
 * Three pricing decisions are deliberate here:
 *  - Match is the featured tier because it is the complete version of what
 *    the business does, not because it is the most expensive. It is labelled
 *    "Most complete", never "Most popular" — there is no data to say that.
 *  - Programmes show a weekly figure beside the fee. It is the same price,
 *    read at the scale people actually budget in.
 *  - The free assessment sits above the ladder, so the cheapest honest step
 *    is always visible beside the dearest.
 */

const FEATURED = "match";

const SHORT_INCLUDES: Record<string, readonly string[]> = {
  "clarity-audit": [
    "Full readiness assessment",
    "60-minute diagnostic with a coach",
    "Your written readiness map",
    "One first action per obstacle",
  ],
  "ready-in-90": [
    "Everything in the Clarity Audit",
    "Six one-to-one coaching sessions",
    "Weekly small-cohort sessions",
    "Exercises with written feedback",
  ],
  match: [
    "Everything in Ready in 90",
    "Verified, private profile",
    "A named matchmaker for nine months",
    "Introductions, each with a written reason",
    "A debrief after every meeting",
  ],
  "private-concierge": [
    "Everything in Match",
    "A named principal on your search",
    "Discreet, off-platform outreach",
    "Travel and scheduling handled",
  ],
};

export function Tick() {
  return (
    <span className="tick" aria-hidden>
      <svg viewBox="0 0 12 12" className="size-2.5">
        <path
          d="M2.5 6.2 5 8.5l4.5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function PriceLadder({
  currency,
  placement,
}: {
  currency: Currency;
  placement: string;
}) {
  return (
    <div>
      <Spotlight className="flex flex-col gap-5 rounded-[24px] border border-hairline bg-onink/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex items-center gap-5">
          <p className="numeral display-md text-onink">Free</p>
          <div>
            <p className="text-[15px] font-semibold text-onink">The readiness assessment</p>
            <p className="text-[14px] text-onink-dim">
              Twelve private minutes. Eight dimensions. One recommended next step.
            </p>
          </div>
        </div>
        <Button asChild variant="quiet" className="shrink-0">
          <Link
            href="/assessment"
            data-analytics-event="cta_click"
            data-analytics-label="free_assessment"
            data-analytics-placement={placement}
          >
            Start free
          </Link>
        </Button>
      </Spotlight>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCTS.map((product) => {
          const featured = product.slug === FEATURED;
          const price = priceFor(product, currency);
          const weekly = product.weeks ? Math.round(price / product.weeks) : null;

          return (
            <Spotlight
              as="article"
              key={product.slug}
              id={product.slug}
              className={cn(
                "tier flex scroll-mt-28 flex-col p-7",
                featured && "tier-featured foil-ring xl:-my-3 xl:py-10",
              )}
            >
              <div className="flex min-h-7 items-center justify-between gap-3">
                <p className="engraved text-onink-faint">
                  {product.weeks ? `${product.weeks} weeks` : product.applicationOnly ? "By application" : "One sitting"}
                </p>
                {featured && (
                  <span className="engraved rounded-full bg-rose/15 px-3 py-1.5 text-[9px] text-rose">
                    Most complete
                  </span>
                )}
              </div>
              <h3 className="display mt-5 text-[1.75rem] text-onink">{product.name.replace("VowFound ", "")}</h3>
              <p className="mt-3 min-h-[4.5rem] text-[14px] leading-relaxed text-onink-dim">{product.summary}</p>

              <div className="mt-6 border-t border-hairline pt-6">
                <p className="numeral display text-[2.6rem] text-onink">
                  {product.applicationOnly && (
                    <span className="mr-2 align-middle font-sans text-[13px] font-medium tracking-normal text-onink-faint">
                      from
                    </span>
                  )}
                  <CurrencyAmount amount={price} currency={currency} />
                </p>
                <p className="mt-2 min-h-5 text-[13px] text-onink-faint">
                  {weekly
                    ? `About ${formatPrice(weekly, currency)} a week`
                    : product.applicationOnly
                      ? "Scope agreed in writing first"
                      : "Paid once. Yours to keep."}
                </p>
              </div>

              <ul className="mt-6 grid flex-1 content-start gap-3">
                {(SHORT_INCLUDES[product.slug] ?? product.includes).map((line) => (
                  <li key={line} className="flex gap-3 text-[14px] leading-snug text-onink">
                    <Tick />
                    {line}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={featured ? "primary" : "quiet"}
                className="mt-8 w-full"
              >
                <Link
                  href={`/checkout/${product.slug}`}
                  data-analytics-event="cta_click"
                  data-analytics-label={product.slug}
                  data-analytics-placement={placement}
                >
                  {product.applicationOnly ? "Apply privately" : `Choose ${product.name.replace("VowFound ", "").replace("The ", "")}`}
                </Link>
              </Button>
            </Spotlight>
          );
        })}
      </div>
    </div>
  );
}
