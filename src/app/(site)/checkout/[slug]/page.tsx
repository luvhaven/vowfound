import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Section } from "@/components/ui/layout";
import { Paper, PaperInset } from "@/components/ui/paper";
import { Guarantee } from "@/components/site/guarantee";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { productBySlug, priceFor, PRODUCTS } from "@/lib/products";
import { resolveCurrency, currencyOptions } from "@/lib/currency.server";
import { VowMark } from "@/components/ui/ornament";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  return {
    title: product ? product.name : "Not found",
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const [currency, options] = await Promise.all([
    resolveCurrency(),
    currencyOptions(),
  ]);

  return (
    <Section>
      <Container width="default">
        <div className="grid gap-8 border-b border-hairline pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="engraved text-rose">
              {product.applicationOnly ? "Private application" : "Secure enrolment"}
            </p>
            <h1 className="display-lg mt-5 max-w-3xl text-onink">{product.name}</h1>
            <p className="measure mt-5 text-onink-dim">{product.summary}</p>
          </div>
          <div className="flex items-center gap-4 md:flex-col md:items-end">
            <VowMark size={72} className="shrink-0" />
            <p className="engraved text-onink-faint">Confidential / encrypted</p>
          </div>
        </div>

        <div className="mt-10 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
          <Paper className="min-w-0 p-7 md:p-9">
            <CheckoutForm
              slug={product.slug}
              applicationOnly={product.applicationOnly ?? false}
            />
          </Paper>

          <div className="min-w-0 space-y-6 md:sticky md:top-28">
            <Paper className="p-7">
              <p className="engraved text-slate">
                {product.applicationOnly ? "Programme under consideration" : "What you are buying"}
              </p>
              <p className="display-md mt-4 text-ink">{product.name}</p>
              <p className="mt-2 text-[15px] text-slate">{product.shape}</p>

              <hr className="hairline-stock my-6" />

              <ul className="space-y-2.5">
                {product.includes.map((line) => (
                  <li key={line} className="flex gap-3 text-[15px] text-ink">
                    <span
                      aria-hidden
                      className="mt-[0.6em] h-px w-4 shrink-0 bg-stone"
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <hr className="hairline-stock my-6" />

              <div className="flex items-baseline justify-between">
                <p className="engraved text-slate">
                  {product.applicationOnly ? "Published fee" : "Total"}
                </p>
                <p className="numeral display-md text-ink">
                  <CurrencyAmount
                    amount={priceFor(product, currency)}
                    currency={currency}
                  />
                </p>
              </div>

              <div className="mt-5">
                <CurrencySwitch current={currency} options={options} />
              </div>

              <PaperInset className="mt-6">
                <p className="text-[14px] leading-relaxed text-slate">
                  {product.applicationOnly ? (
                    <>
                      No payment is taken with this application. Fees are
                      discussed only after a private review and fit call.
                    </>
                  ) : (
                    <>
                      Paid securely through{" "}
                      {currency === "NGN" ? "Paystack" : "Stripe"}. We never
                      see or store your card details.
                    </>
                  )}
                </p>
              </PaperInset>
            </Paper>

            <Guarantee />

            <p className="text-[14px] leading-relaxed text-onink-faint">
              By continuing you agree to the{" "}
              <Link
                href="/legal/terms"
                className="underline decoration-onink-faint underline-offset-4"
              >
                terms
              </Link>{" "}
              and confirm you are 18 or over.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
