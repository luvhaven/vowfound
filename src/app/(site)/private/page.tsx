import type { Metadata } from "next";
import { Block, PageHero, Wrap } from "@/components/ui/kit";
import { Split } from "@/components/site/story";
import { ApplyForm } from "@/components/site/forms";
import { Rings } from "@/components/art/shapes";
import { productBySlug, formatPrice, priceFor } from "@/lib/products";
import { resolveCurrency } from "@/lib/currency.server";

export const metadata: Metadata = {
  title: "Private",
  description: "A principal-led, discreet twelve-month search for clients who need total privacy. By application.",
};

export default async function PrivatePage() {
  const currency = await resolveCurrency();
  const product = productBySlug("private")!;
  return (
    <>
      <PageHero
        eyebrow="Private · by application"
        field="ink"
        title={<>Quietly, <span className="say font-normal text-butter">properly.</span></>}
        body={`For people whose lives are public, complicated or very specific. A named principal leads your search for twelve months, off-platform and in total confidence. From ${formatPrice(priceFor(product, currency), currency)}.`}
        art={<Rings />}
      >
        <a href="#apply" className="btn btn-lg bg-butter text-ink">Apply privately</a>
      </PageHero>

      <Split
        field="butter"
        eyebrow="What changes"
        title={<>Your search, <span className="say font-normal">done for you.</span></>}
        body="Private is everything in Matched, run personally by a principal, with outreach beyond our own members. We handle scheduling and travel, keep your name out of every system we can, and take only a few clients at a time."
        listTitle="Private includes"
        listColour="paper"
        list={product.includes}
      />

      <Block field="paper" id="apply" className="scroll-mt-24">
        <Wrap className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="h1">Apply.</h2>
            <p className="mt-6 max-w-sm text-[18px] font-medium text-ink-soft">
              No payment now. A principal reads your application, then arranges a confidential call to agree scope and fees in writing.
            </p>
          </div>
          <ApplyForm />
        </Wrap>
      </Block>
    </>
  );
}
