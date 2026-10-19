import type { Metadata } from "next";
import { Block, CtaButton, PageHero, Wrap } from "@/components/ui/kit";
import { PriceCards } from "@/components/site/price-cards";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { Burst } from "@/components/art/shapes";
import { resolveCurrency } from "@/lib/currency.server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Every VowFound price, published: free Readiness Check, The Read, Ready, Matched and Private.",
};

const ROWS: [string, ...(string | boolean)[]][] = [
  ["Readiness report", true, true, true, true],
  ["Call with a coach", "30 min", true, true, true],
  ["One-to-one coaching", false, "6 sessions", "6 sessions", "6+ sessions"],
  ["Small-group sessions", false, "12 weeks", "12 weeks", "12 weeks"],
  ["Profile & story rewrite", false, true, true, true],
  ["Verified private profile", false, false, true, true],
  ["Named matchmaker", false, false, "6 months", "12 months"],
  ["Introductions with a reason", false, false, true, true],
  ["Debrief after every date", false, false, true, true],
  ["Principal-led, off-platform search", false, false, false, true],
];

const MONEY = [
  { q: "Is the Readiness Check really free?", a: "Yes. No card, no trial, no catch. It's how most people decide whether they need us at all." },
  { q: "What's The Read credit?", a: "Buy The Read, then join Ready or Matched within 30 days using the same email, and what you paid for The Read comes off automatically." },
  { q: "Can I pay by bank transfer?", a: "In naira, yes — bank transfer and USSD are offered at checkout. For larger dollar payments by wire, email us first." },
  { q: "Do you take a success fee?", a: "No. You pay for the work, never for an outcome. Nobody earns a bonus for getting you engaged." },
];

export default async function PricingPage() {
  const currency = await resolveCurrency();
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        field="butter"
        title={<>Every price, <span className="say font-normal">out loud.</span></>}
        body="No sales call to find out what it costs. Start free, and only pay for the smallest step that actually helps."
        art={
          <Burst fill="tomato">
            <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1410" fontFamily="var(--font-bricolage)">START</text>
            <text x="50" y="63" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1410" fontFamily="var(--font-bricolage)">FREE</text>
          </Burst>
        }
      >
        <CtaButton href="/check" tone="ink">Take the free check</CtaButton>
      </PageHero>

      <Block field="paper">
        <Wrap>
          <PriceCards currency={currency} />
        </Wrap>
      </Block>

      <Block field="paper-deep" className="border-y-2 border-ink">
        <Wrap>
          <h2 className="h2 rise">Side by side.</h2>
          <div className="sticker rise mt-10 overflow-x-auto bg-paper">
            <table className="w-full min-w-[42rem] text-left">
              <caption className="sr-only">What each plan includes</caption>
              <thead>
                <tr className="border-b-2 border-ink">
                  <th scope="col" className="p-5 label">Included</th>
                  {["The Read", "Ready", "Matched", "Private"].map((t) => (
                    <th key={t} scope="col" className={cn("p-5 text-center font-display text-lg font-extrabold", t === "Matched" && "bg-cobalt text-paper")}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, ...vals]) => (
                  <tr key={label} className="border-b-2 border-ink/10 last:border-0">
                    <th scope="row" className="p-5 text-[15px] font-semibold">{label}</th>
                    {vals.map((v, i) => (
                      <td key={i} className={cn("p-5 text-center text-[14px] font-bold", i === 2 && "bg-cobalt/10")}>
                        {v === true ? <span aria-label="Included">✓</span> : v === false ? <span className="text-ink-mute" aria-label="Not included">—</span> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrap>
      </Block>

      <Block field="lilac">
        <Wrap className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="h1 rise">Money <span className="say font-normal">questions.</span></h2>
          <Faq items={MONEY} />
        </Wrap>
      </Block>

      <FinalCta />
    </>
  );
}
