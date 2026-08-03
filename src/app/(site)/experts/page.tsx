import type { Metadata } from "next";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { EXPERT_ROLES } from "@/content/site";

export const metadata: Metadata = {
  title: "The people who do the work",
  description:
    "Four roles: matchmakers, readiness coaches, clinical advisers and safety reviewers.",
};

export default function ExpertsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The people who do the work"
        title="Four roles. Named profiles appear as each seat is filled."
        standfirst="We are not going to put invented headshots and invented credentials on this page while we are hiring. When someone joins, their name, their background and their photograph go here."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="01 / 04"
              eyebrow="The practice"
              title="Different responsibilities stay in different hands."
            />
          </Reveal>
          <ol className="mt-14 border-b border-hairline">
            {EXPERT_ROLES.map((item, i) => (
              <Reveal as="li" key={item.role} delay={i * 55}>
                <article className="grid gap-5 border-t border-hairline py-9 md:grid-cols-[4rem_0.72fr_1.28fr] md:gap-9">
                  <p className="numeral display text-[2.25rem] leading-none text-onink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="display-md text-onink">{item.role}</h2>
                  <div>
                    <p className="text-[16px] leading-relaxed text-onink-dim">
                    {item.body}
                    </p>
                    <p className="engraved mt-6 text-rose">
                      Profiles published when appointed
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="default">
          <Reveal>
            <h2 className="display-lg text-onink">
              One structural detail worth knowing.
            </h2>
            <div className="measure mt-8 space-y-5 text-onink-dim">
              <p>
                Safety reviewers do not report to anyone whose job involves
                revenue. They can end a membership, refuse a verification, or
                stop an introduction without asking permission from the person
                who sold that membership.
              </p>
              <p>
                Coaches also do not receive a bonus for moving you onto a
                matchmaking programme. If your coach tells you that you are not
                ready for stage four, that advice costs the business money,
                which is the only arrangement under which you can trust it.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="A coach reads your map before your first call."
        body="Take the assessment and the conversation starts with something specific rather than an introduction."
      />
    </>
  );
}
