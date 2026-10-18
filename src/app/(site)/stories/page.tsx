import { Container, Section } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { SamplePlan } from "@/components/site/sample-plan";
import { createPageMetadata } from "@/lib/seo";
import { getContent } from "@/lib/content/read.server";

export const metadata = createPageMetadata({
  title: "Stories",
  description:
    "Explore illustrative readiness guidance and our standards for publishing client experiences.",
  path: "/stories",
});

const RULES = [
  {
    title: "A real person, with a written release",
    body: "Publish only with the client's permission, an approved display name, and a written release held privately on file.",
  },
  {
    title: "Their words, not ours",
    body: "Use the client's approved words. Any edits for length should preserve their meaning and be approved before publication.",
  },
  {
    title: "No stock photography of people",
    body: "A client photograph is optional and requires permission. Illustrative photography must never be presented as the person whose experience is described.",
  },
  {
    title: "No numbers we cannot show you",
    body: "Any published outcome statistic should explain the period, sample size, definition, and how the result was verified.",
  },
  {
    title: "The ones that did not work, too",
    body: "Describe the work completed and what remained unresolved. A useful engagement does not always end in marriage, and individual experiences are not guarantees.",
  },
];

export default async function StoriesPage() {
  const t = await getContent();
  const caseStudies = [0, 1]
    .map((i) => ({
      title: t(`caseStudy.${i}.title`),
      context: t(`caseStudy.${i}.context`),
      outcome: t(`caseStudy.${i}.outcome`),
      attribution: t(`caseStudy.${i}.attribution`),
    }))
    .filter(
      (story) =>
        story.title !== "Add a consented case study title" &&
        story.context !== "Add the verified starting situation and work delivered" &&
        story.outcome !== "Add the verified outcome and relevant limitations",
    );

  return (
    <>
      <PageHeader
        eyebrow="Stories"
        title="See what useful progress can look like."
        standfirst="Explore a sample plan before you begin. There are no published client case studies yet; the example below is fictional and demonstrates the approach."
      />

      <Section><Container width="default"><SamplePlan /></Container></Section>
      {caseStudies.length > 0 && (
        <Section className="bg-ink-raised">
          <Container width="wide">
            <h2 className="display-lg max-w-2xl text-onink">
              Client experiences
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {caseStudies.map((story) => (
                <article
                  key={story.title}
                  className="rounded-xl border border-hairline p-7 md:p-9"
                >
                  <h3 className="display-md text-onink">{story.title}</h3>
                  <p className="mt-5 whitespace-pre-line text-onink-dim">
                    {story.context}
                  </p>
                  <p className="mt-5 whitespace-pre-line text-onink-dim">
                    {story.outcome}
                  </p>
                  {story.attribution !== "Add approved attribution or write Anonymous" && (
                    <p className="mt-6 text-sm font-medium text-rose">
                      {story.attribution}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </Container>
        </Section>
      )}
      <Section>
        <Container width="wide">
          <Reveal>
            <p className="engraved text-onink-faint">
              What we will publish, and under what rules
            </p>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-12">
            {RULES.map((rule, i) => (
              <Reveal
                key={rule.title}
                delay={(i % 2) * 60}
                className={
                  i === 0 || i === 3
                    ? "md:col-span-7"
                    : i === 4
                      ? "md:col-span-12"
                      : "md:col-span-5"
                }
              >
                <Paper className="h-full p-7 md:p-9">
                  <p className="numeral engraved text-oxblood">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="display mt-5 text-[1.35rem] text-ink md:text-[1.55rem]">
                    {rule.title}
                  </h2>
                  <p className="mt-4 text-[16px] leading-relaxed text-slate">
                    {rule.body}
                  </p>
                </Paper>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <PageCta
        title="Start with your own situation."
        body="Take the free assessment for a preliminary snapshot, or book a consultation to discuss the support you need."
      />
    </>
  );
}
