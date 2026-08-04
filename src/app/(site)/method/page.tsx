import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { MethodStages } from "@/components/site/method-stages";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "The method",
  description:
    "Five stages, in order: See Clearly, Become Ready, Define the Right Fit, Meet Intentionally, Build Toward Commitment.",
  path: "/method",
});

export default function MethodPage() {
  return (
    <>
      <PageHeader
        eyebrow="The method"
        title="Five stages. Always in this order."
        standfirst="See clearly. Become ready. Define the right fit. Meet intentionally. Build toward commitment. Most people have been living at stage four, which is why the same thing keeps happening."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="01 / 05"
              eyebrow="The sequence"
              title="Do the work before asking the introduction to do it for you."
            />
          </Reveal>
          <MethodStages detailed />
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="default">
          <Reveal>
            <Paper className="px-7 py-9 md:px-12 md:py-12">
              <p className="engraved text-slate">Why the order matters</p>
              <p className="display-md mt-5 text-ink">
                Introductions made to someone who is not ready produce the same
                three months they have already had, four more times.
              </p>
              <hr className="hairline-stock my-7" />
              <p className="text-[16px] leading-relaxed text-slate">
                This is the whole argument. A matchmaking service that skips
                stages one to three is selling volume, and volume is the thing
                you have already tried. We would rather spend the first weeks
                making you someone the right person would choose, and then spend
                the rest of the time finding them.
              </p>
            </Paper>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="Stage one is free and takes twelve minutes."
        body="The assessment is the whole of stage one's diagnostic. You do not have to buy anything to find out what it says."
      />
    </>
  );
}
