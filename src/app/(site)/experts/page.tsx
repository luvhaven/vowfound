import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { EXPERT_ROLES } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";
import { getContent } from "@/lib/content/read.server";

export const metadata = createPageMetadata({
  title: "The people who do the work",
  description:
    "Four roles: matchmakers, readiness coaches, clinical advisers and safety reviewers.",
  path: "/experts",
});

export default async function ExpertsPage() {
  const t = await getContent();
  const people = [0, 1]
    .map((i) => ({
      name: t(`practitioner.${i}.name`),
      role: t(`practitioner.${i}.role`),
      bio: t(`practitioner.${i}.bio`),
      coverage: t(`practitioner.${i}.coverage`),
    }))
    .filter(
      (person) =>
        person.name.trim() !== "Add verified practitioner name" &&
        person.bio.trim() !== "Add verified biography and qualifications",
    );
  return (
    <>
      <PageHeader
        eyebrow="The people who do the work"
        title="Feel confident about who supports you."
        standfirst={
          people.length
            ? "Explore practitioner backgrounds and contact us to confirm availability and who would support your engagement."
            : "Practitioner profiles are not published yet. Contact us to confirm current availability, relevant experience, and who would support your engagement before purchasing."
        }
      />

      <Section>
        <Container width="wide">
          {people.length > 0 && (
            <div className="mb-14 grid gap-6 md:grid-cols-2">
              {people.map((person) => (
                <article
                  key={person.name}
                  className="rounded-xl border border-hairline p-8"
                >
                  <p className="text-sm text-rose">{person.role}</p>
                  <h2 className="display-md mt-3">{person.name}</h2>
                  <p className="mt-5 whitespace-pre-line text-onink-dim">
                    {person.bio}
                  </p>
                  {person.coverage !== "Add verified languages and service coverage" && (
                    <p className="mt-5 text-sm text-onink-dim">
                      {person.coverage}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
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
                    <p className="mt-6 text-sm font-medium text-rose">
                      Ask who currently holds this responsibility
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
              Questions to ask before you begin.
            </h2>
            <div className="measure mt-8 space-y-5 text-onink-dim">
              <p>
                Confirm who handles your engagement, who reviews safety
                concerns, and how you can raise a complaint. Ask for relevant
                qualifications and experience before choosing a practitioner.
              </p>
              <p>
                Review the recommended scope, fees, and any referral or sales
                incentives. You should understand why a programme fits your
                situation and feel free to decide against it.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="Discuss the support you need."
        body="Ask about practitioner availability, programme scope, and whether your situation fits before choosing an engagement."
      />
    </>
  );
}
