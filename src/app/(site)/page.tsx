import { Block, CtaButton, Eyebrow, Wrap } from "@/components/ui/kit";
import { Burst, Overlap, Pair, Rings, Sparkle, Squiggle, Sun, HUE } from "@/components/art/shapes";
import { PriceCards } from "@/components/site/price-cards";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { DimensionPeek } from "@/components/site/dimension-peek";
import { FAQ, NOT_AN_APP, PROMISES, STEPS } from "@/lib/content";
import { resolveCurrency } from "@/lib/currency.server";

const MARQUEE = ["No swiping", "No public profile", "Human-picked introductions", "A reason for every match", "Coaching built in", "Both say yes first"];

export default async function HomePage() {
  const currency = await resolveCurrency();

  return (
    <>
      {/* --- Hero ------------------------------------------------------- */}
      <Block field="paper" className="pb-10 pt-8 md:pb-16 md:pt-14">
        <Wrap className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative z-10">
            <Eyebrow className="pop-in bg-butter">Matchmaking + coaching, for people who mean it</Eyebrow>
            <h1 className="mega pop-in mt-7" style={{ "--d": "80ms" } as React.CSSProperties}>
              Less swiping.
              <br />
              More <span className="say relative inline-block font-normal text-tomato">
                forever.
                <Squiggle stroke="tomato" className="absolute -bottom-3 left-0 h-4 w-full" />
              </span>
            </h1>
            <p className="pop-in mt-9 max-w-xl text-[19px] font-medium leading-relaxed text-ink-soft md:text-[21px]" style={{ "--d": "180ms" } as React.CSSProperties}>
              VowFound gets you ready for marriage, then introduces you to people who want it too —
              hand-picked by a real matchmaker, never an algorithm.
            </p>
            <div className="pop-in mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center" style={{ "--d": "260ms" } as React.CSSProperties}>
              <CtaButton href="/check">Take the free Readiness Check</CtaButton>
              <a href="#how" className="text-[16px] font-bold underline decoration-2 underline-offset-[6px] hover:text-tomato">
                How it works
              </a>
            </div>
            <p className="pop-in mt-6 text-[14px] font-semibold text-ink-mute" style={{ "--d": "320ms" } as React.CSSProperties}>
              Free · 10 minutes · Results instantly · No card
            </p>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
            <div className="pop-in absolute inset-0 rounded-full border-2 border-ink bg-cobalt" style={{ "--d": "120ms" } as React.CSSProperties} />
            <Sun fill="butter" className="pop-in absolute left-[8%] top-[10%] w-[50%]" style={{ "--d": "220ms" } as React.CSSProperties} />
            <Pair a="tomato" b="bubble" className="pop-in absolute bottom-[4%] left-1/2 w-[58%] -translate-x-1/2" style={{ "--d": "300ms" } as React.CSSProperties} />
            <div className="bob absolute -right-2 top-[6%] w-[32%] rotate-12 sm:-right-6">
              <Burst fill="butter">
                <text x="50" y="45" textAnchor="middle" fontSize="15" fontWeight="800" fill="#1a1410" fontFamily="var(--font-bricolage)">FREE</text>
                <text x="50" y="62" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1a1410" fontFamily="var(--font-bricolage)">10 MIN</text>
              </Burst>
            </div>
            <div className="sticker bob absolute -left-2 bottom-[16%] rotate-[-6deg] bg-paper px-4 py-3 [animation-delay:-2s] sm:-left-8">
              <p className="text-[14px] font-extrabold leading-tight">A person picks<br />every match.</p>
            </div>
            <Sparkle fill="paper" className="spin-slow absolute right-[18%] top-[42%] w-10" />
          </div>
        </Wrap>
      </Block>

      {/* --- Marquee ---------------------------------------------------- */}
      <div className="marquee -rotate-1 border-y-2 border-ink bg-ink py-5 text-paper" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="marquee-track">
            {MARQUEE.map((m) => (
              <span key={m} className="flex items-center gap-10 whitespace-nowrap font-display text-[1.75rem] font-extrabold tracking-[-0.04em]">
                {m}
                <Sparkle fill="butter" className="w-6" />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* --- Not an app ------------------------------------------------- */}
      <Block field="cobalt" className="mt-[-1px]">
        <Wrap>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="rise">
              <Eyebrow>Not a dating app</Eyebrow>
              <h2 className="h1 mt-6">
                Apps are built to keep you <span className="say font-normal text-butter">single.</span>
              </h2>
            </div>
            <p className="rise max-w-xl text-[19px] font-medium leading-relaxed opacity-90">
              Their business works when you keep swiping. Ours only works when you stop — because
              you&apos;ve found someone. That changes everything about how we do it.
            </p>
          </div>

          <div className="mt-14 grid gap-3">
            <div className="label grid grid-cols-2 gap-3 px-2 opacity-70">
              <span>The apps</span>
              <span>VowFound</span>
            </div>
            {NOT_AN_APP.map(([them, us], i) => (
              <div key={them} className="rise grid grid-cols-2 gap-3" style={{ animationDelay: `${i * 40}ms` }}>
                <p className="rounded-[18px] border-2 border-paper/40 px-5 py-4 text-[16px] font-semibold text-paper/70 line-through decoration-tomato decoration-2">
                  {them}
                </p>
                <p className="sticker rounded-[18px] bg-paper px-5 py-4 text-[16px] font-bold text-ink shadow-[4px_4px_0_#1a1410]">{us}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </Block>

      {/* --- How it works ---------------------------------------------- */}
      <Block field="paper" id="how" className="scroll-mt-24">
        <Wrap>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="rise">
              <Eyebrow className="bg-bubble">How it works</Eyebrow>
              <h2 className="h1 mt-6 max-w-3xl">
                Ready first. <span className="say font-normal">Then introduced.</span>
              </h2>
            </div>
            <Rings className="rise hidden w-48 md:block" />
          </div>
          <ol className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className="sticker sticker-hover rise flex flex-col p-7"
                style={{ background: HUE[s.colour], color: s.colour === "cobalt" ? "#fff6e9" : "#1a1410", rotate: `${i % 2 ? 1 : -1}deg` }}
              >
                <span className="font-display text-[4.5rem] font-extrabold leading-none tracking-[-0.06em]">{s.n}</span>
                <h3 className="h3 mt-8">{s.title}</h3>
                <p className="mt-3 text-[16px] font-medium leading-relaxed opacity-90">{s.body}</p>
              </li>
            ))}
          </ol>
        </Wrap>
      </Block>

      {/* --- The check -------------------------------------------------- */}
      <Block field="butter">
        <Wrap className="grid items-center gap-14 lg:grid-cols-2">
          <div className="rise">
            <Eyebrow>The Readiness Check</Eyebrow>
            <h2 className="h1 mt-6">
              Six things decide if a marriage <span className="say font-normal">lasts.</span>
            </h2>
            <p className="mt-7 max-w-lg text-[19px] font-medium leading-relaxed">
              Clarity, room, patterns, presence, standards and repair. The check scores each one on
              its own — no single grade, no judgement — and hands you your first move on the weakest.
            </p>
            <div className="mt-10">
              <CtaButton href="/check" tone="ink">Find out in 10 minutes</CtaButton>
            </div>
          </div>
          <div className="rise">
            <DimensionPeek />
          </div>
        </Wrap>
      </Block>

      {/* --- Promises --------------------------------------------------- */}
      <Block field="paper">
        <Wrap>
          <div className="rise max-w-3xl">
            <Eyebrow className="bg-lilac">Our rules</Eyebrow>
            <h2 className="h1 mt-6">
              Private by default. <span className="say font-normal">Human by design.</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((p, i) => (
              <div key={p.title} className="sticker rise bg-paper p-7" style={{ rotate: `${[-1.2, 0.8, -0.6, 1][i]}deg` }}>
                <Overlap a={(["tomato", "cobalt", "moss", "bubble"] as const)[i]} b="paper" lens="butter" className="w-20" />
                <h3 className="h3 mt-6">{p.title}</h3>
                <p className="mt-3 text-[15px] font-medium leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </Block>

      {/* --- Pricing ---------------------------------------------------- */}
      <Block field="paper-deep" id="pricing" className="scroll-mt-24 border-y-2 border-ink">
        <Wrap>
          <div className="rise flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow className="bg-tomato">Pricing</Eyebrow>
              <h2 className="h1 mt-6 max-w-3xl">
                Every price, <span className="say font-normal">out loud.</span>
              </h2>
            </div>
            <p className="max-w-md text-[18px] font-medium leading-relaxed text-ink-soft">
              No “book a call to find out”. Start with the free check — most people should begin with The Read.
            </p>
          </div>
          <div className="mt-16">
            <PriceCards currency={currency} />
          </div>
          <div className="sticker rise mt-14 grid items-center gap-6 bg-moss p-8 text-paper md:grid-cols-[auto_1fr] md:p-10">
            <Burst fill="butter" className="w-24">
              <text x="50" y="57" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1a1410" fontFamily="var(--font-bricolage)">OUR WORD</text>
            </Burst>
            <div>
              <p className="h3">If we haven&apos;t made your agreed introductions, your search is extended — free — until we do.</p>
              <p className="mt-3 text-[15px] font-medium opacity-80">
                We guarantee the work, not the outcome. Nobody can promise you a marriage, and anyone who does is the red flag.
              </p>
            </div>
          </div>
        </Wrap>
      </Block>

      {/* --- FAQ -------------------------------------------------------- */}
      <Block field="bubble">
        <Wrap className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rise">
            <Eyebrow>Fair questions</Eyebrow>
            <h2 className="h1 mt-6">
              Ask us <span className="say font-normal">anything.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[18px] font-medium">
              Something not here? <a href="/contact" className="font-bold underline decoration-2 underline-offset-4">Write to a person.</a>
            </p>
          </div>
          <Faq items={FAQ} />
        </Wrap>
      </Block>

      <FinalCta />
    </>
  );
}
