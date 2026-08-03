import type { Metadata } from "next";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { PlanCards } from "@/components/site/plan-cards";
import { Guarantee } from "@/components/site/guarantee";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Four ways to work with us. The figure is shared with your readiness map, once we know which one you actually need.",
};

export default function PlansPage() {
  return (
    <>
      <PageHeader
        eyebrow="Working together"
        title="Four ways in. Most people should start with the first."
        standfirst="We do not quote a figure before we know what you need, because the honest recommendation for about half of the people who ask is the cheapest thing on this page."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="01 / 04"
              eyebrow="Programme architecture"
              title="Each level adds responsibility, not decorative extras."
              body="Start with the smallest useful intervention. Move into coaching, matchmaking, or concierge support only when the evidence supports it."
            />
          </Reveal>
          <PlanCards />
          <div className="mt-14">
            <Reveal>
              <Guarantee />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="default">
          <Reveal>
            <h2 className="display-lg text-onink">
              Why the price is not on this page.
            </h2>
            <div className="measure mt-8 space-y-5 text-onink-dim">
              <p>
                Because a number without a recommendation is just an
                affordability test, and it sorts people by budget rather than by
                what would help them.
              </p>
              <p>
                Finish the assessment and your readiness map arrives with one
                recommendation, its price, and the prices of the other three so
                you can disagree with us. It takes twelve minutes and costs
                nothing.
              </p>
              <p>
                If you would rather ask a person first, book a consultation. We
                will tell you the figure on the call.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="Twelve minutes, then a number."
        body="The assessment ends with a recommendation and what it costs, in your currency."
      />
    </>
  );
}
