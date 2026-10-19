import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PRODUCTS, productBySlug, formatPrice, priceFor } from "@/lib/products";
import { currencyOptions, resolveCurrency } from "@/lib/currency.server";
import { getMember } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { HUE, Overlap } from "@/components/art/shapes";
import { Tick, Wrap } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();
  if (product.applicationOnly) redirect("/private#apply");

  const [currency, options, member] = await Promise.all([
    resolveCurrency(),
    currencyOptions(),
    getMember().catch(() => null),
  ]);
  const dark = product.colour === "cobalt" || product.colour === "moss";

  return (
    <section className="py-12 md:py-20">
      <Wrap className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="sticker p-8 md:p-10" style={{ background: HUE[product.colour], color: dark ? "#fff6e9" : "#1a1410" }}>
          <p className="label opacity-80">You&apos;re choosing</p>
          <h1 className="h1 mt-4">{product.name}</h1>
          <p className="mt-4 text-[18px] font-medium">{product.hook}</p>
          <p className="num mt-8 font-display text-6xl font-extrabold tracking-[-0.05em]">
            {formatPrice(priceFor(product, currency), currency)}
          </p>
          <ul className="mt-8 grid gap-3 border-t-2 border-current/30 pt-6">
            {product.includes.map((line) => (
              <li key={line} className="flex gap-3 font-semibold">
                <Tick />
                {line}
              </li>
            ))}
          </ul>
          <Overlap a="paper" b="butter" lens="bubble" className="mt-10 w-32" />
        </div>
        <div className="lg:pt-6">
          <h2 className="h2">Almost there.</h2>
          <p className="mt-4 max-w-md text-[17px] font-medium text-ink-soft">
            Payment is handled securely by Flutterwave
            {currency === "NGN" ? " — card, bank transfer or USSD" : ""}. Then a person from VowFound emails you to
            book your first session.
          </p>
          <div className="mt-8">
            <CheckoutForm
              slug={product.slug}
              currency={currency}
              options={options}
              defaultEmail={member?.email}
              defaultName={member?.full_name ?? undefined}
            />
          </div>
          <p className="mt-8 text-[14px] text-ink-mute">
            Not sure?{" "}
            <Link href="/check" className="font-bold underline">
              Take the free check first
            </Link>
            . See our{" "}
            <Link href="/legal/refunds" className="font-bold underline">
              refund terms
            </Link>
            .
          </p>
        </div>
      </Wrap>
    </section>
  );
}
