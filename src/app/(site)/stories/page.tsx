import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "We have not published any yet, and these are the rules we will publish them under.",
};

const RULES = [
  {
    title: "A real person, with a written release",
    body: "A first name they chose, and a signed release on file before anything appears. Our database will not let a story be published without one, which is a constraint rather than a promise.",
  },
  {
    title: "Their words, not ours",
    body: "Lightly edited for length only. Nothing paraphrased into something more flattering, nothing composited from several clients into one convenient person.",
  },
  {
    title: "No stock photography of people",
    body: "If a story has no photograph, it will have no photograph. We would rather show you white space than a person who does not exist.",
  },
  {
    title: "No numbers we cannot show you",
    body: "No success rates, no member counts, no average time to engagement. When we have enough clients for those to mean anything, we will publish the method alongside the figure.",
  },
  {
    title: "The ones that did not work, too",
    body: "People who finished a programme and did not marry are part of the picture. When one of them is willing to say so publicly, that goes here as well.",
  },
];

export default function StoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Stories"
        title="We have not published any yet."
        standfirst="This is a new practice. A wall of glowing quotes today would mean we had written them ourselves. You would be right to question that on any site."
      />

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
        title="Judge us on the assessment instead."
        body="It is free, it takes twelve minutes, and it is a much better test of whether we understand your situation than a quote from a stranger."
      />
    </>
  );
}
