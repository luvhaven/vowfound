import Link from "next/link";
import { BAND_LABEL, DIMENSIONS, bandFor, firstPriority, type Scores } from "@/lib/readiness";
import { productBySlug, formatPrice, priceFor, type Currency } from "@/lib/products";
import { HUE, Burst } from "@/components/art/shapes";
import { CtaButton, Tick, Wrap } from "@/components/ui/kit";
import { EmailResults } from "@/components/check/email-results";

const WHY: Record<string, string> = {
  "the-read": "You've got real strengths and one or two things worth a closer look. A coach reading this with you for 30 minutes will tell you which matter — and whether you need more than that.",
  ready: "There's something specific in the way, and introductions won't fix it. Twelve weeks on it now saves years of meeting the right people at the wrong time.",
  matched: "No big gaps. You sound ready to meet people deliberately — the coaching built into Matched keeps it that way while your matchmaker searches.",
};

export function ResultsView({
  scores,
  recommended,
  firstName,
  currency,
  checkId,
  hasEmail = true,
}: {
  scores: Scores;
  recommended: string;
  firstName?: string | null;
  currency: Currency;
  checkId?: string;
  hasEmail?: boolean;
}) {
  const first = DIMENSIONS.find((d) => d.key === firstPriority(scores))!;
  const product = productBySlug(recommended)!;
  const strongest = DIMENSIONS.reduce((max, d) => (scores[d.key] > scores[max.key] ? d : max), DIMENSIONS[0]);

  return (
    <>
      <section className="bg-butter py-16 md:py-24">
        <Wrap>
          <p className="label">Your Readiness Check</p>
          <h1 className="h1 mt-5 max-w-4xl">
            {firstName ? `${firstName}, your` : "Your"} strongest is <span className="say font-normal">{strongest.name.toLowerCase()}.</span> Start with{" "}
            <span className="say font-normal">{first.name.toLowerCase()}.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[19px] font-medium">
            No overall score — on purpose. A single number would be a grade, and you aren&apos;t one. Each part stands on its own.
          </p>
        </Wrap>
      </section>

      {checkId && !hasEmail && (
        <div className="pt-10">
          <Wrap>
            <EmailResults id={checkId} />
          </Wrap>
        </div>
      )}

      <section className="py-16 md:py-20">
        <Wrap className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d) => {
            const value = scores[d.key];
            const band = bandFor(value);
            const dark = d.colour === "cobalt" || d.colour === "moss";
            const isFirst = d.key === first.key;
            return (
              <article key={d.key} className="sticker relative flex flex-col p-6" style={{ background: HUE[d.colour], color: dark ? "#fff6e9" : "#1a1410" }}>
                {isFirst && (
                  <span className="label absolute -top-4 right-5 rotate-3 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-ink">Start here</span>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="h3">{d.name}</h2>
                  <p className="num font-display text-4xl font-extrabold">{value}</p>
                </div>
                <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-current bg-paper/40">
                  <div className="h-full bg-current" style={{ width: `${value}%` }} />
                </div>
                <p className="label mt-3">{BAND_LABEL[band]}</p>
                <p className="mt-4 text-[15px] font-medium leading-relaxed">{value < 55 ? d.low : `Solid ground. ${d.question}`}</p>
                <p className="mt-4 border-t-2 border-current/30 pt-4 text-[15px] font-bold leading-snug">Your move: {d.move}</p>
              </article>
            );
          })}
        </Wrap>
      </section>

      <section className="border-y-2 border-ink bg-cobalt py-16 text-paper md:py-24">
        <Wrap className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="label opacity-80">Your smallest useful next step</p>
            <h2 className="h1 mt-5">{product.name}.</h2>
            <p className="mt-6 max-w-xl text-[19px] font-medium leading-relaxed">{WHY[recommended]}</p>
            <ul className="mt-8 grid max-w-xl gap-3">
              {product.includes.slice(0, 4).map((line) => (
                <li key={line} className="flex gap-3 text-[16px] font-semibold">
                  <Tick />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <CtaButton href={`/checkout/${product.slug}`} tone="butter">
                Start {product.name} · {formatPrice(priceFor(product, currency), currency)}
              </CtaButton>
              <Link href="/pricing" className="font-bold underline decoration-2 underline-offset-4">
                Compare every option
              </Link>
            </div>
          </div>
          <Burst fill="tomato" className="bob mx-auto w-full max-w-xs">
            <text x="50" y="44" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1410" fontFamily="var(--font-bricolage)">YOUR FIRST</text>
            <text x="50" y="60" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1410" fontFamily="var(--font-bricolage)">{first.name.toUpperCase()}</text>
          </Burst>
        </Wrap>
      </section>

      <section className="py-14">
        <Wrap className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-[16px] font-medium text-ink-soft">
            These results are a starting point, not a diagnosis. Keep the link private — anyone with it can see this page.
          </p>
          <Link href="/sign-up" className="btn bg-paper text-ink">Save to an account</Link>
        </Wrap>
      </section>
    </>
  );
}
