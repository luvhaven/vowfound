import Link from "next/link";
import { PRODUCTS, priceFor, type Currency } from "@/lib/products";
import { Paper, PaperInset } from "@/components/ui/paper";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "@/components/ui/currency-amount";

/**
 * Programme architecture is presented as a progression, not four pricing
 * towers. Pricing remains exclusive to results and checkout.
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

                  <div className="mt-6">
                    {showPrices && currency ? (
                      <Button
                        asChild
                        variant={isRecommended ? "primary" : "onpaper"}
                        size="md"
                        className="w-full"
                      >
                        <Link href={`/checkout/${product.slug}`}>
                          {product.applicationOnly ? "Apply" : "Continue"}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="onpaper" size="md" className="w-full">
                        <Link href="/assessment">Start the assessment</Link>
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
