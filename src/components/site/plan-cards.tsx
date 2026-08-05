import Link from "next/link";
import { PRODUCTS, priceFor, formatPrice, type Currency } from "@/lib/products";
import { Paper, PaperInset } from "@/components/ui/paper";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "@/components/ui/currency-amount";

/**
 * Programme architecture is presented as a progression, not four pricing
 * towers.
 *
 * showPrices governs both the fee and the action, deliberately as one switch.
 * They were separate once, and the result was a page that quoted ₦60,000 above
 * a button leading to the assessment — the buyer saw a price and could not pay
 * it. Tying them together makes that state unrepresentable.
 */
export function PlanCards({
  currency,
  showPrices = false,
  recommended,
}: {
  currency?: Currency;
  showPrices?: boolean;
  recommended?: string;
}) {
  return (
    <div className="mt-14 grid gap-4">
      {PRODUCTS.map((product, index) => {
        const isRecommended = recommended === product.slug;
        return (
          <Reveal key={product.slug} delay={index * 55}>
            <Paper
              id={product.slug}
              className="group scroll-mt-32 p-6 md:p-8 lg:p-9"
            >
              <article className="grid gap-8 lg:grid-cols-[4rem_0.9fr_1.1fr_0.72fr] lg:items-start lg:gap-10">
                <div className="flex items-center justify-between lg:block">
                  <p className="numeral display text-[2.75rem] leading-none text-stone">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  {isRecommended && (
                    <span className="engraved rounded-[8px] bg-ink px-3 py-2 text-stock lg:hidden">
                      Recommended
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="display-md text-ink">{product.name}</h3>
                      <p className="engraved mt-3 text-oxblood">{product.shape}</p>
                    </div>
                    {isRecommended && (
                      <span className="engraved hidden shrink-0 rounded-[8px] bg-ink px-3 py-2 text-stock lg:block">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-5 text-[16px] leading-relaxed text-slate">
                    {product.summary}
                  </p>
                </div>

                <div className="border-t border-stone pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <p className="engraved text-slate">Included</p>
                  <ul className="mt-4 grid gap-2.5">
                    {product.includes.map((line) => (
                      <li key={line} className="text-[14px] leading-relaxed text-ink">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex h-full flex-col justify-between border-t border-stone pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  {showPrices && currency ? (
                    <div>
                      <p className="engraved text-slate">Programme fee</p>
                      <p className="numeral display-md mt-3 text-ink">
                        <CurrencyAmount
                          amount={priceFor(product, currency)}
                          currency={currency}
                        />
                      </p>
                    </div>
                  ) : (
                    <PaperInset className="p-4">
                      <p className="text-[13px] leading-relaxed text-slate">
                        Your map recommends one programme and shows its price.
                      </p>
                    </PaperInset>
                  )}

                  {/* A price with no way to pay is the single worst thing this
                      card can do. Wherever a fee is shown, the button beneath
                      it goes to checkout — the assessment stays available
                      underneath for anyone not ready to choose. */}
                  <div className="mt-6">
                    {showPrices && currency ? (
                      <>
                        <Button
                          asChild
                          variant={isRecommended ? "primary" : "onpaper"}
                          size="md"
                          className="w-full"
                        >
                          <Link href={`/checkout/${product.slug}`}>
                            {product.applicationOnly
                              ? "Apply for this"
                              : `Pay ${formatPrice(priceFor(product, currency), currency)}`}
                          </Link>
                        </Button>
                        <Link
                          href="/assessment"
                          className="mt-3 block text-center text-[13px] leading-relaxed text-slate underline decoration-stone underline-offset-4 hover:text-ink"
                        >
                          Not sure this is the one? Take the free assessment
                        </Link>
                      </>
                    ) : (
                      <Button asChild variant="onpaper" size="md" className="w-full">
                        <Link href="/assessment">Start free assessment</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            </Paper>
          </Reveal>
        );
      })}
    </div>
  );
}
