import type { Metadata } from "next";
import Link from "next/link";
import { settleOrder } from "@/lib/orders.server";
import { productBySlug } from "@/lib/products";
import { Burst, Pair } from "@/components/art/shapes";
import { Wrap } from "@/components/ui/kit";
import { TrackOnMount } from "@/components/site/track-on-mount";

export const metadata: Metadata = { title: "Payment", robots: { index: false, follow: false } };

/** Flutterwave redirects here. The query string is only a hint: the order is
 *  marked paid only after settleOrder verifies the transaction directly. */
export default async function DonePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  let paid = false;
  let product: string | undefined;

  if (sp.tx_ref && sp.transaction_id && sp.status !== "cancelled") {
    try {
      const result = await settleOrder(sp.tx_ref, sp.transaction_id);
      paid = result.ok;
      if (result.ok) product = productBySlug(result.order.product)?.name;
    } catch (error) {
      console.error("[done] settle failed", error);
    }
  }

  const message = paid
    ? `Your payment for ${product} is confirmed and a receipt is on its way. A real person from VowFound will email you to book your first session.`
    : sp.status === "cancelled"
      ? "The payment was cancelled, so nothing was charged. Try again whenever you're ready."
      : "We couldn't confirm this payment yet. If money left your account it will be matched automatically — or email hello@vowfound.com with your reference and we'll sort it out.";

  return (
    <section className={paid ? "bg-moss py-20 text-paper md:py-28" : "bg-paper-deep py-20 md:py-28"}>
      {paid && <TrackOnMount event="purchase" props={{ plan: product ?? "" }} />}
      <Wrap className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h1 className="mega">{paid ? "You're in." : "Not quite."}</h1>
          <p className="mt-8 max-w-xl text-[20px] font-medium leading-relaxed">{message}</p>
          <div className="mt-10">
            {paid ? (
              <Link href="/account" className="btn btn-lg bg-butter text-ink">
                Go to my account
              </Link>
            ) : (
              <Link href="/pricing" className="btn btn-lg bg-tomato text-ink">
                Back to pricing
              </Link>
            )}
          </div>
        </div>
        {paid ? <Pair a="butter" b="bubble" className="bob mx-auto w-full max-w-xs" /> : <Burst fill="butter" className="mx-auto w-48" />}
      </Wrap>
    </section>
  );
}
