import type { Metadata } from "next";
import { Container, Section, Eyebrow, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { SAFETY_POINTS } from "@/content/site";

export const metadata: Metadata = {
  title: "Safety and verification",
  description:
    "Adults only. Verified identities. Mutual consent before any identity is revealed. Nothing browsable, nothing indexed.",
};

const VERIFICATION = [
  {
    stage: "At signup",
    items: [
      "You confirm you are 18 or over",
      "Your email address is verified",
      "Your phone number is verified",
    ],
  },
  {
    stage: "Before any introduction",
    items: [
      "Government-issued ID is checked against your profile",
      "A safety reviewer approves or rejects, and records which",
      "Anything that does not reconcile stops the process there",
    ],
  },
  {
    stage: "Optional, where lawful",
    items: [
      "Background checks, with your separate written consent",
      "Employment confirmation",
      "Each of these is consented to on its own and can be withdrawn",
    ],
  },
];

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Safety and verification"
        title="You are handing us the most private thing about you."
        standfirst="This category is thick with fraud, and being sceptical of us is the correct starting position. Here is exactly what we do."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="01 / 06"
              eyebrow="The safety standard"
              title="Privacy is a sequence of decisions, not a badge in the footer."
            />
          </Reveal>
          <ol className="mt-14 border-b border-hairline">
            {SAFETY_POINTS.map((point, i) => (
              <Reveal as="li" key={point.title} delay={(i % 3) * 50}>
                <article className="group grid gap-5 border-t border-hairline py-8 md:grid-cols-[4rem_0.75fr_1.25fr] md:gap-8 md:py-10">
                  <p className="numeral display text-[2.25rem] leading-none text-onink-faint transition-colors group-hover:text-rose">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="display text-[1.35rem] leading-snug text-onink">
                    {point.title}
                  </h2>
                  <p className="text-[16px] leading-relaxed text-onink-dim">
                    {point.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="wide">
          <Reveal>
            <Eyebrow>Verification, in order</Eyebrow>
          </Reveal>
          <div className="mt-14 space-y-px">
            {VERIFICATION.map((group, i) => (
              <Reveal key={group.stage} delay={i * 60}>
                <div className="grid gap-5 border-t border-hairline py-9 md:grid-cols-[16rem_1fr] md:gap-10">
                  <h2 className="engraved text-onink">{group.stage}</h2>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[16px] text-onink-dim"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.65em] h-px w-4 shrink-0 bg-sage"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="default">
          <Reveal>
            <Paper className="px-7 py-9 md:px-12 md:py-12">
              <p className="engraved text-slate">If something goes wrong</p>
              <p className="display-md mt-5 text-ink">
                Blocking is instant. A trained person reads every report, and
                tells you what happened.
              </p>
              <hr className="hairline-stock my-7" />
              <div className="space-y-4 text-[16px] leading-relaxed text-slate">
                <p>
                  Blocking someone takes effect immediately and does not require
                  anyone&rsquo;s approval. It also ends any open introduction
                  between you.
                </p>
                <p>
                  Reports go to a safety reviewer, not to a support queue and
                  not to anyone whose job involves keeping you as a client.
                  Reviewers can end a membership without consulting sales, and
                  they have.
                </p>
                <p>
                  If a report concerns something criminal, we will say so, and
                  we will help you take it where it needs to go.
                </p>
              </div>
            </Paper>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="Read the privacy page as well."
        body="It covers what we hold, who can see it, and how to remove all of it without asking a person."
      />
    </>
  );
}
