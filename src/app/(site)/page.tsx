import Image from "next/image";
import Link from "next/link";
import heroImage from "../../../public/images/vowfound-hero-global.webp";
import commitmentImage from "../../../public/images/vowfound-commitment.webp";
import { Container, Section } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { Kinetic } from "@/components/ui/kinetic";
import { SaveTheDate } from "@/components/home/save-the-date";
import { HeroReading } from "@/components/home/hero-reading";
import { PulseCheck } from "@/components/home/pulse-check";
import { MethodStory } from "@/components/home/method-story";
import { IntroductionReasonPreview } from "@/components/home/introduction-reason-preview";
import { PriceLadder } from "@/components/site/price-ladder";
import { Guarantee } from "@/components/site/guarantee";
import { FaqList } from "@/components/site/faq-list";
import { StickyCta } from "@/components/site/sticky-cta";
import { METHOD, OBJECTIONS, RECOGNITION } from "@/content/site";
import { getContent } from "@/lib/content/read.server";
import { resolveCurrency } from "@/lib/currency.server";

/* Each of these answers an objection a visitor has before they have voiced
   it. They scroll, so none of them has to fight for the hero. */
const PRINCIPLES = [
  "No swiping",
  "No public profile",
  "A person reads every map",
  "A written reason for every introduction",
  "Nothing shared until both say yes",
  "Every fee published",
  "Export or delete your data any time",
] as const;

export default async function HomePage() {
  // Every editable string on this page resolves through t(). A key with no
  // override falls back to the default in the registry, so the page renders
  // identically before anyone has opened the admin.
  const [t, currency] = await Promise.all([getContent(), resolveCurrency()]);

  const line1 = t("home.hero.title.line1");
  const line2 = t("home.hero.title.line2");

  const stages = METHOD.map((stage, i) => ({
    name: t(`method.${i}.name`),
    summary: t(`method.${i}.summary`),
    body: stage.body,
    outputs: stage.outputs,
  }));

  const faqs = OBJECTIONS.map((item, i) => ({ q: t(`faq.${i}.q`), a: t(`faq.${i}.a`) }));

  return (
    <>
      {/* --- Hero ---------------------------------------------------------- */}
      <section className="hero-2027 overflow-hidden" data-analytics-section="hero">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>

        <Container
          width="wide"
          className="grid items-center gap-12 pb-16 pt-10 md:pt-14 lg:min-h-[min(calc(100svh-5rem),56rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-20"
        >
          <div className="relative z-10">
            <p className="engraved fade-up flex items-center gap-3 text-rose" style={{ "--d": "0ms" } as React.CSSProperties}>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-rose" />
              </span>
              {t("home.hero.eyebrow")}
            </p>

            <h1 className="hero-title mt-7 text-onink">
              <span className="block">
                <Kinetic text={line1} />
              </span>
              <span className="block">
                <Kinetic text={line2} offset={line1.split(" ").length} className="vow-italic" />
              </span>
            </h1>

            <p
              className="fade-up mt-8 max-w-xl text-[18px] leading-relaxed text-onink-dim md:text-[20px]"
              style={{ "--d": "520ms" } as React.CSSProperties}
            >
              {t("home.hero.support")}
            </p>

            <div className="fade-up mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center" style={{ "--d": "680ms" } as React.CSSProperties}>
              <Button asChild size="lg" className="h-16 px-9 text-[15px]">
                <Link
                  href="/assessment"
                  data-analytics-event="cta_click"
                  data-analytics-label="begin_assessment"
                  data-analytics-placement="hero"
                >
                  {t("home.hero.cta")}
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </Button>
              <Link
                href="#pulse"
                className="group inline-flex items-center gap-2 whitespace-nowrap text-[15px] text-onink-dim transition-colors hover:text-onink"
                data-analytics-event="cta_click"
                data-analytics-label="pulse_anchor"
                data-analytics-placement="hero"
              >
                <span className="underline decoration-onink-faint/50 underline-offset-[6px] group-hover:decoration-rose">
                  Or take the 60-second pulse
                </span>
              </Link>
            </div>

            <p className="fade-up mt-6 text-[13px] tracking-wide text-onink-faint" style={{ "--d": "800ms" } as React.CSSProperties}>
              {t("home.hero.reassurance")}
            </p>
          </div>

          <div className="relative">
            <figure className="hero-frame relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] lg:max-h-[46rem]">
              <Image
                src={heroImage}
                alt="A newly married couple sharing a quiet laugh at home"
                fill
                priority
                placeholder="blur"
                sizes="(max-width: 1023px) 100vw, 48vw"
                className="object-cover object-[58%_center]"
              />
            </figure>
            <div
              className="fade-up relative z-10 -mt-24 flex justify-end px-4 sm:absolute sm:-bottom-12 sm:right-6 sm:mt-0 sm:px-0 lg:-bottom-14 lg:-left-14 lg:right-auto xl:-left-20"
              style={{ "--d": "900ms" } as React.CSSProperties}
            >
              <HeroReading />
            </div>
          </div>
        </Container>
      </section>

      {/* --- Principles marquee ------------------------------------------- */}
      <section aria-label="The VowFound standard" className="mt-10 border-y border-hairline py-6 lg:mt-0">
        <ul className="sr-only">
          {PRINCIPLES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <div className="marquee" aria-hidden>
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-track">
              {PRINCIPLES.map((p) => (
                <span key={p} className="flex items-center gap-12 whitespace-nowrap font-display text-[1.35rem] italic text-onink-dim">
                  {p}
                  <span className="size-1.5 rounded-full bg-rose/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* --- Recognition --------------------------------------------------- */}
      <Section id="recognition" data-analytics-section="recognition">
        <Container width="wide">
          <Reveal className="max-w-3xl">
            <p className="engraved text-rose">If any of this sounds familiar</p>
            <h2 className="display-lg mt-6 text-onink">{t("home.recognition.title")}</h2>
            <p className="measure mt-6 text-[18px] leading-relaxed text-onink-dim">
              {t("home.recognition.standfirst")}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {RECOGNITION.slice(0, 4).map((_, i) => (
              <Reveal key={i} delay={i * 60}>
                <Spotlight
                  as="article"
                  className="group h-full rounded-[28px] border border-hairline bg-onink/[0.02] p-8 transition-colors duration-500 hover:border-onink/20 md:p-10"
                >
                  <p className="numeral text-[13px] text-onink-faint">0{i + 1}</p>
                  <h3 className="display mt-6 text-[1.75rem] text-onink md:text-[2rem]">
                    {t(`home.recognition.${i}.title`)}
                  </h3>
                  <p className="mt-4 text-[16px] leading-relaxed text-onink-dim">
                    {t(`home.recognition.${i}.body`)}
                  </p>
                </Spotlight>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-14 grid gap-8 border-t border-hairline pt-10 lg:grid-cols-[1fr_1fr] lg:items-end">
              <h3 className="display-md max-w-xl text-onink">{t("home.reframe.heading")}</h3>
              <p className="text-[16px] leading-relaxed text-onink-dim">{t("home.reframe.body")}</p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* --- Pulse check --------------------------------------------------- */}
      <Section id="pulse" className="scroll-mt-20 bg-ink-raised/60" data-analytics-section="pulse">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="engraved text-rose">Before anything else</p>
              <h2 className="display-lg mt-6 text-onink">Three questions. One honest signal.</h2>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-onink-dim">
                Not a personality quiz and not a score. Three questions that
                tell you where the useful work probably starts, before you
                commit twelve minutes to the full assessment.
              </p>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-hairline pt-8">
                <div>
                  <dt className="text-[12px] text-onink-faint">Takes</dt>
                  <dd className="numeral display-md mt-1 text-onink">60s</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-onink-faint">Costs</dt>
                  <dd className="numeral display-md mt-1 text-onink">0</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-onink-faint">Stored</dt>
                  <dd className="numeral display-md mt-1 text-onink">Never</dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={80}>
              <PulseCheck />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* --- Method -------------------------------------------------------- */}
      <Section id="method" data-analytics-section="method">
        <Container width="wide">
          <Reveal className="max-w-3xl">
            <p className="engraved text-rose">How it works</p>
            <h2 className="display-lg mt-6 text-onink">
              Readiness first. Then introductions worth having.
            </h2>
            <p className="measure mt-6 text-[18px] leading-relaxed text-onink-dim">
              Five stages, in this order on purpose. Dating apps start at stage
              four. Most of what decides a marriage happens before it.
            </p>
          </Reveal>
          <div className="mt-16">
            <MethodStory stages={stages} />
          </div>
        </Container>
      </Section>

      {/* --- The introduction letter -------------------------------------- */}
      <Section className="bg-ink-raised/60" data-analytics-section="deliverable">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="engraved text-rose">What arrives</p>
              <h2 className="display-lg mt-6 text-onink">Every introduction comes with a reason.</h2>
              <div className="measure mt-7 space-y-5 text-[17px] leading-relaxed text-onink-dim">
                <p>
                  Not a name in an inbox. A matchmaker writes down where your
                  intentions meet, which of your requirements are met, and what
                  is worth asking about early rather than discovering at month
                  nine.
                </p>
                <p>
                  Decline any of them without explaining yourself. Nothing
                  identifying is shared until you both accept.
                </p>
              </div>
            </Reveal>
            <IntroductionReasonPreview />
          </div>
        </Container>
      </Section>

      {/* --- The destination ---------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[36rem] md:min-h-[46rem]">
          <Image
            src={commitmentImage}
            alt="A newly married couple walking hand in hand through a garden"
            fill
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,18,24,0.85)_0%,rgba(17,18,24,0.2)_40%,rgba(17,18,24,0.88)_100%)]" aria-hidden />
          <Container width="wide" className="relative flex min-h-[36rem] items-end pb-16 md:min-h-[46rem] md:pb-24">
            <Reveal className="max-w-3xl">
              <p className="engraved text-rose">The point</p>
              <p className="display-lg mt-6 text-onink">
                Not more introductions. <span className="vow-italic">One good decision,</span> made
                with clarity, by two people who mean the same thing by commitment.
              </p>
            </Reveal>
          </Container>
        </div>
      </section>

      {/* --- Pricing ------------------------------------------------------- */}
      <Section id="pricing" className="scroll-mt-20" data-analytics-section="pricing">
        <Container width="wide">
          <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="engraved text-rose">Fees</p>
              <h2 className="display-lg mt-6 text-onink">Every fee, in the open.</h2>
              <p className="mt-6 text-[18px] leading-relaxed text-onink-dim">
                No sales call to find out the price. Start with the smallest
                useful step; most people should.
              </p>
            </div>
            <Link href="/plans" className="text-[15px] text-onink-dim underline decoration-onink-faint/50 underline-offset-[6px] hover:text-onink">
              Compare everything in detail
            </Link>
          </Reveal>
          <div className="mt-14">
            <PriceLadder currency={currency} placement="home_pricing" />
          </div>
          <div className="mt-10">
            <Reveal>
              <Guarantee />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* --- Questions ----------------------------------------------------- */}
      <Section className="border-t border-hairline" data-analytics-section="faq">
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <p className="engraved text-rose">Fair questions</p>
              <h2 className="display-lg mt-6 text-onink">Asked before anyone pays.</h2>
              <Link href="/faq" className="mt-8 inline-block text-[15px] text-onink-dim underline underline-offset-[6px] hover:text-onink">
                Every question we are asked
              </Link>
            </Reveal>
            <div className="[&>div]:mt-0">
              <FaqList items={faqs} limit={6} />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Closing: give the future a date ------------------------------ */}
      <Section id="begin" className="final-vow scroll-mt-24 overflow-hidden border-t border-hairline" data-analytics-section="closing">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
            <Reveal>
              <h2 className="display-xl text-onink">{t("home.closing.title")}</h2>
              <p className="mt-7 max-w-lg text-[18px] leading-relaxed text-onink-dim">{t("home.closing.body")}</p>
              <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-16 px-9 text-[15px]">
                  <Link href="/assessment" data-analytics-event="cta_click" data-analytics-label="begin_assessment" data-analytics-placement="closing">
                    {t("home.hero.cta")}
                  </Link>
                </Button>
                <Link href="/book" className="text-[15px] text-onink-dim underline decoration-onink-faint/50 underline-offset-[6px] hover:text-onink">
                  Prefer to speak to a person first?
                </Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="engraved mb-4 text-onink-faint">{t("home.begin.title")}</p>
              <SaveTheDate />
            </Reveal>
          </div>
        </Container>
      </Section>

      <StickyCta />
    </>
  );
}
