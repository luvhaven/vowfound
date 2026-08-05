import Image from "next/image";
import Link from "next/link";
import heroImage from "../../../public/images/vowfound-hero-global.webp";
import ringsImage from "../../../public/images/vowfound-rings.png";
import commitmentImage from "../../../public/images/vowfound-commitment.png";
import { Container, Section } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { SaveTheDate } from "@/components/home/save-the-date";
import { AssessmentComparison } from "@/components/home/assessment-comparison";
import { IntroductionReasonPreview } from "@/components/home/introduction-reason-preview";
import { HumanAccountability } from "@/components/home/human-accountability";
import { FaqList } from "@/components/site/faq-list";
import { resolvedObjections } from "@/lib/content/resolve.server";
import { Guarantee } from "@/components/site/guarantee";
import { MethodStages } from "@/components/site/method-stages";
import { Rings, RuleOrnament, VowMark } from "@/components/ui/ornament";
import { RECOGNITION, SAFETY_POINTS } from "@/content/site";
import { getContent } from "@/lib/content/read.server";

const TRUST_POINTS = [
  "Free 12-minute assessment",
  "Human-made introductions",
  "No public profile",
  "Consent before disclosure",
] as const;

const MATCHMAKING_PROMISES = [
  {
    title: "A person chooses",
    body: "A matchmaker reads every shortlist, makes the final call, and records the reasoning.",
  },
  {
    title: "You know why",
    body: "Every introduction comes with a clear explanation of why this person surfaced now.",
  },
  {
    title: "Both people say yes",
    body: "Names, photographs, and contact details stay private until two people accept.",
  },
] as const;

export default async function HomePage() {
  // Every editable string on this page resolves through t(). A key with no
  // override falls back to the default in the registry, so the page renders
  // identically before anyone has opened the admin.
  const t = await getContent();
  const objections = await resolvedObjections();

  return (
    <>
      <section className="home-hero relative overflow-hidden" data-analytics-section="hero">
        <Container
          width="wide"
          className="grid min-h-[calc(100dvh-4rem)] items-center gap-7 py-7 md:gap-10 md:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10"
        >
          <div className="hero-copy relative z-10 max-w-xl">
            {/* The eyebrow names the category, because "Get married on
                purpose" is a promise rather than a description — on its own it
                could be a church, a coach or a wedding planner. The photograph
                carries the warmth, so the words carry the meaning. */}
            <p className="engraved text-rose">{t("home.hero.eyebrow")}</p>
            <h1 className="home-hero-title display-xl mt-5 text-onink md:mt-6">
              {t("home.hero.title.line1")}
              <br />
              {t("home.hero.title.line2")}
            </h1>
            {/* One paragraph, not three. An earlier version stacked a
                supporting sentence, an audience line, a what-happens-next line
                and a trust line beneath the headline — four blocks of small
                text competing for the same glance, which is how a hero stops
                being read at all. The audience and the mechanism now live
                inside these two sentences. */}
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-onink-dim md:mt-6 md:text-lg">
              {t("home.hero.support")}
            </p>

            {/* One decision, not two. The secondary is a link precisely so it
                cannot compete for the same click. */}
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center md:mt-10">
              <Button asChild size="lg">
                <Link
                  href="#begin"
                  data-analytics-event="cta_click"
                  data-analytics-label="begin_assessment"
                  data-analytics-placement="hero"
                >
                  {t("home.hero.cta")}
                </Link>
              </Button>
              <Link
                href="/how-it-works"
                className="engraved whitespace-nowrap text-onink-dim underline decoration-onink-faint/50 underline-offset-[6px] transition-colors hover:text-onink"
                data-analytics-event="cta_click"
                data-analytics-label="how_it_works"
                data-analytics-placement="hero"
              >
                {t("home.hero.secondaryCta")}
              </Link>
            </div>

            {/* The single line under the button: what it costs, how long it
                takes, and the two objections that stop people clicking. */}
            <p className="engraved mt-6 max-w-lg text-onink-dim">
              {t("home.hero.reassurance")}
            </p>
          </div>

          <figure className="hero-portrait relative min-h-[15rem] overflow-hidden rounded-[24px] md:min-h-[38rem]">
            <Image
              src={heroImage}
              alt="A newly married couple sharing a quiet laugh at home"
              fill
              priority
              placeholder="blur"
              sizes="(max-width: 1023px) 100vw, 58vw"
              className="object-cover object-[58%_center]"
            />
            <div className="portrait-scrim" aria-hidden />
            <VowMark size={128} className="ring-orbit" />
          </figure>
        </Container>
      </section>

      <section aria-label="How VowFound works" className="trust-rail border-y border-hairline">
        <Container width="wide" className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex min-h-20 items-center border-b border-hairline pr-8 lg:w-56 lg:border-b-0 lg:border-r">
            <p className="engraved text-rose">The VowFound standard</p>
          </div>
          <ul className="grid flex-1 grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <li
                key={point}
                className="flex min-h-20 items-center border-hairline px-5 text-left text-[13px] font-medium leading-relaxed text-onink-dim max-lg:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0"
              >
                {point}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Anchor target for the hero CTA. scroll-mt clears the sticky header. */}
      <Section
        id="begin"
        data-analytics-section="marriage_horizon"
        className="relative scroll-mt-24 overflow-hidden"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20">
            <Reveal>
              <Rings size={78} className="mb-8" />
              <h2 className="display-lg max-w-lg text-onink">
                {t("home.begin.title")}
              </h2>
              <p className="mt-6 max-w-md text-onink-dim">
                {t("home.begin.body")}
              </p>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-onink-faint">
                {t("home.begin.note")}
              </p>
              <div className="mt-8 border-t border-hairline pt-6">
                <p className="text-sm font-semibold text-onink">
                  By the end, you have:
                </p>
                <ul className="mt-4 grid gap-3 text-sm text-onink-dim">
                  <li>An eight-dimension readiness map</li>
                  <li>One priority to work on first</li>
                  <li>A recommended way forward</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <SaveTheDate />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section
        id="recognition"
        data-analytics-section="recognition"
        className="bg-ink-raised"
      >
        <Container width="wide">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
              <h2 className="display-lg text-onink">
                {t("home.recognition.title")}
              </h2>
              <p className="text-onink-dim lg:pb-2">
                {t("home.recognition.standfirst")}
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {RECOGNITION.slice(0, 4).map((item, index) => (
              <Reveal key={item.title} delay={(index % 2) * 80}>
                <article className="recognition-note">
                  <h3 className="display text-[1.55rem] leading-tight text-onink md:text-[1.8rem]">
                    {t(`home.recognition.${index}.title`)}
                  </h3>
                  <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-onink-dim">
                    {t(`home.recognition.${index}.body`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* The reframe. The clearest statement of why this is not a dating app,
          placed where recognition has just done its work. */}
      <Section className="reframe-band border-y border-hairline !py-20 md:!py-28">
        <Container width="default">
          <Reveal>
            <div className="text-center">
              <RuleOrnament className="mx-auto mb-10 opacity-70" />
              <h2 className="display-lg text-onink">{t("home.reframe.heading")}</h2>
              <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-onink-dim">
                {t("home.reframe.body")}
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="overflow-hidden">
        <Container width="wide">
          <div className="commitment-frame relative min-h-[34rem] overflow-hidden rounded-[24px] md:min-h-[44rem]">
            <Image
              src={commitmentImage}
              alt="A newly married couple walking hand in hand through a garden"
              fill
              placeholder="blur"
              sizes="(max-width: 767px) 100vw, 1200px"
              className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
            />
            <div className="commitment-scrim" aria-hidden />
            <Reveal className="absolute inset-x-5 bottom-5 md:inset-x-auto md:bottom-8 md:left-8 md:max-w-xl">
              <Paper className="p-7 md:p-10" foil={false}>
                <p className="engraved text-slate">The destination matters</p>
                <h2 className="display-lg mt-5 text-ink">
                  The point is not more introductions.
                </h2>
                <p className="mt-5 text-slate">
                  It is one good decision, made with clarity, care, and two
                  people who mean the same thing by commitment.
                </p>
              </Paper>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Two products were both called a readiness map, which made the paid
          one look like the free one with a price attached. */}
      <Section id="assessment" data-analytics-section="assessment">
        <Container width="wide">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
              <h2 className="display-lg text-onink">
                Everyone starts in the same place. Not everyone needs the same
                thing next.
              </h2>
              <p className="text-[17px] leading-relaxed text-onink-dim lg:pb-2">
                The assessment is free and always will be. What it produces is a
                snapshot, not a professional reading — and the difference
                matters enough to be explicit about it.
              </p>
            </div>
          </Reveal>
          <div className="mt-14">
            <AssessmentComparison />
          </div>
        </Container>
      </Section>

      {/* The written reason is the whole differentiator, and it stays abstract
          until somebody can see one. */}
      <Section className="bg-ink-raised" data-analytics-section="deliverable">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="engraved text-rose">What arrives</p>
              <h2 className="display-lg mt-6 text-onink">
                Matchmaking should feel personal because it is.
              </h2>
              <div className="measure mt-7 space-y-5 text-[17px] leading-relaxed text-onink-dim">
                <p>
                  An introduction is not a name in an inbox. It comes with the
                  reasoning: where your intentions meet, which of your
                  requirements are satisfied, and what is worth asking about
                  early rather than discovering at month nine.
                </p>
                <p>
                  You can decline any of them without explaining yourself, and
                  nothing identifying is exchanged until you both accept.
                </p>
              </div>
            </Reveal>
            <IntroductionReasonPreview />
          </div>
        </Container>
      </Section>

      <Section id="method" data-analytics-section="method" className="bg-ink-raised">
        <Container width="wide">
          <Reveal>
            <p className="engraved text-onink-faint">The VowFound method</p>
            <h2 className="display-lg mt-6 max-w-3xl text-onink">
              From honest self-knowledge to a real introduction.
            </h2>
          </Reveal>

          <MethodStages />

          <Reveal>
            <div className="mt-14">
              <Button asChild variant="quiet">
                <Link href="/method">Read the full method</Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section id="matchmaking" data-analytics-section="matchmaking">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                <Image
                  src={ringsImage}
                  alt="Two gold wedding bands beside a deep red flower and vow paper"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1023px) 100vw, 54vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                />
              </div>
            </Reveal>

            <div>
              <Reveal>
                <h2 className="display-lg text-onink">
                  Matchmaking should feel personal because it is.
                </h2>
                <p className="mt-6 text-onink-dim">
                  No directory. No public profile. No introduction made by a
                  system on its own.
                </p>
              </Reveal>

              <div className="mt-10 space-y-8">
                {MATCHMAKING_PROMISES.map((promise, index) => (
                  <Reveal key={promise.title} delay={index * 70}>
                    <article className="promise-row">
                      <h3 className="display text-[1.4rem] text-onink">
                        {promise.title}
                      </h3>
                      <p className="mt-2 text-[16px] leading-relaxed text-onink-dim">
                        {promise.body}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <div className="mt-10">
                  <Button asChild variant="quiet">
                    <Link href="/matchmaking">Explore matchmaking</Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* Credibility without a founder's face. The practice is deliberately
          not personality-led, so responsibility is described by role. */}
      <Section id="accountability" data-analytics-section="accountability">
        <Container width="wide">
          <HumanAccountability />
        </Container>
      </Section>

      <Section id="care" className="bg-ink-raised">
        <Container width="wide">
          <div className="care-grid grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <Reveal>
              <Paper className="h-full p-8 md:p-12" foil={false}>
                <p className="engraved text-slate">Honest care</p>
                <h2 className="display-lg mt-6 max-w-2xl text-ink">
                  Someone tells you the truth, kindly.
                </h2>
                <p className="mt-6 max-w-2xl text-slate">
                  Coaching is specific: how you tell your story, what you
                  tolerate, what you avoid, and what happens when closeness
                  becomes real.
                </p>
                <div className="mt-10">
                  <Button asChild variant="onpaper">
                    <Link href="/coaching">How coaching works</Link>
                  </Button>
                </div>
              </Paper>
            </Reveal>

            <Reveal delay={90}>
              <div className="safety-panel h-full rounded-[24px] p-8 md:p-10">
                <Rings size={66} />
                <h3 className="display-md mt-8 text-onink">Private stays private.</h3>
                <p className="mt-5 text-[16px] leading-relaxed text-onink-dim">
                  {SAFETY_POINTS[2].body}
                </p>
                <Link
                  href="/safety"
                  className="mt-8 inline-flex text-sm font-semibold text-onink underline decoration-onink-faint underline-offset-8 transition-colors hover:text-rose"
                >
                  See every safeguard
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="mt-6">
            <Reveal>
              <Guarantee />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="questions">
        <Container width="default">
          <Reveal>
            <h2 className="display-lg text-onink">Questions worth asking.</h2>
            <p className="mt-6 max-w-xl text-onink-dim">
              Clear answers about privacy, readiness, matchmaking, and what we
              can honestly promise.
            </p>
          </Reveal>
          <FaqList limit={4} items={objections} />
          <Reveal>
            <div className="mt-10">
              <Button asChild variant="quiet">
                <Link href="/faq">Read every answer</Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="final-vow border-t border-hairline">
        <Container width="default">
          <Reveal>
            <div className="text-center">
              <Rings size={88} className="mx-auto" />
              <h2 className="display-xl mt-8 text-onink">
                Let marriage become more than a someday.
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-onink-dim">
                Begin with twelve private minutes. Leave with a clear reading
                of what comes next.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/assessment">Begin your plan</Link>
                </Button>
                <Button asChild variant="quiet" size="lg">
                  <Link href="/book">Book a consultation</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
