import type { Metadata } from "next";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { FaqList } from "@/components/site/faq-list";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "What actually happens, from the assessment to an introduction, and who is involved at each point.",
};

const STEPS = [
  ["01", "You take the assessment", "Twelve minutes, one question at a time, saved as you go. Nothing is shared and you do not need an account to start.", "You, alone"],
  ["02", "You get your readiness map", "Eight dimensions, a plain reading of each, and one specific first action where there is an obstacle.", "Structured automatically, reviewed if you continue"],
  ["03", "You speak to a person", "Sixty minutes about the map. This is where most people hear the thing nobody has told them. You can stop here.", "A readiness coach"],
  ["04", "You do the readiness work", "Fortnightly private sessions and written feedback. The work follows your obstacles rather than a curriculum everyone receives.", "Your coach"],
  ["05", "You are verified and profiled", "Identity verification and a private matchmaking profile that no member can browse. Optional checks where legally available.", "A safety reviewer"],
  ["06", "A matchmaker searches", "Hard requirements remove. Weighted preferences rank. A matchmaker reads the remaining people and makes the final decision.", "Your matchmaker"],
  ["07", "An introduction is proposed", "Both people receive a written reason. Neither sees who the other is or whether the other has answered.", "Both parties, separately"],
  ["08", "Both say yes, or it does not happen", "Identity and contact details open only after two acceptances. A decline is private and final.", "You and them"],
  ["09", "You meet, then we debrief", "We speak to both sides separately. What we learn adjusts the search, so introduction three is wiser than introduction one.", "Your matchmaker"],
] as const;

const NEVER = [
  "You are never shown a queue of people to judge.",
  "No one can search for you, browse you, or find you here.",
  "No introduction is ever made without a person agreeing to it.",
  "Your identity is never revealed before mutual acceptance.",
  "Nobody is told why you declined them.",
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="Nine handoffs. A person owns every one."
        standfirst="Nothing important here happens unattended. That is slower, more expensive to operate, and the reason the process can be trusted."
      />

      <Section>
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-[0.64fr_1.36fr] lg:gap-20">
            <Reveal>
              <aside className="lg:sticky lg:top-28">
                <SectionIntro
                  index="01 / 09"
                  eyebrow="The client path"
                  title="One deliberate handoff at a time."
                  body="The owner changes as the work changes. The record does not. You can always see what happened, who decided, and what comes next."
                />
              </aside>
            </Reveal>

            <ol className="border-b border-hairline">
              {STEPS.map(([number, title, body, owner], index) => (
                <Reveal as="li" key={number} delay={(index % 3) * 45}>
                  <article className="group border-t border-hairline py-8 md:py-10">
                    <div className="grid gap-5 md:grid-cols-[4rem_1fr]">
                      <p className="numeral display text-[2.25rem] leading-none text-onink-faint transition-colors group-hover:text-rose">
                        {number}
                      </p>
                      <div>
                        <h2 className="display text-[1.45rem] text-onink md:text-[1.7rem]">
                          {title}
                        </h2>
                        <p className="mt-4 text-[16px] leading-relaxed text-onink-dim">
                          {body}
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                          <span className="size-1.5 rounded-full bg-sage" />
                          <p className="engraved text-onink-faint">Owner: {owner}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="wide">
          <Reveal>
            <Paper className="grid gap-9 px-7 py-9 md:grid-cols-[0.65fr_1.35fr] md:px-12 md:py-12">
              <div>
                <p className="engraved text-oxblood">What never happens</p>
                <p className="display-md mt-5 text-ink">No feed. No public exposure. No silent automation.</p>
              </div>
              <ol className="border-t border-stone">
                {NEVER.map((line, index) => (
                  <li key={line} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-stone py-4 text-[15px] text-ink">
                    <span className="numeral text-slate">{index + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>
            </Paper>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="FAQ"
              eyebrow="While you are here"
              title="The questions this process usually raises."
            />
          </Reveal>
          <FaqList limit={5} />
        </Container>
      </Section>

      <PageCta
        title="Start with the part that asks nothing of you but honesty."
        body="The assessment takes twelve private minutes and gives you a useful answer before any sales conversation begins."
      />
    </>
  );
}
