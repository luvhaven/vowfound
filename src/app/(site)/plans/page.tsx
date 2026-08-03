import type { Metadata } from "next";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { PlanCards } from "@/components/site/plan-cards";
import { Guarantee } from "@/components/site/guarantee";
import { Reveal } from "@/components/ui/reveal";
import { resolveCurrency } from "@/lib/currency.server";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Compare VowFound's current marriage-readiness, coaching, matchmaking, and private-concierge programme fees.",
};

export default async function PlansPage() {
  const currency = await resolveCurrency();

  return (
    <>
      <PageHeader
        eyebrow="Working together"
        title="Clear scope. Clear fees. Honest guidance."
        standfirst="See the current fee for every way of working with us. The free assessment then recommends the smallest useful place to begin—never the largest programme we can sell."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="01 / 04"
              eyebrow="Programme architecture"
              title="Each level adds responsibility, not decorative extras."
              body="Compare the scope and current fee now. Start with the smallest useful intervention, then move into coaching, matchmaking, or concierge support only when the evidence supports it."
            />
          </Reveal>
          <PlanCards currency={currency} showPrices directAction={false} />
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
              Why the assessment still comes first.
            </h2>
            <div className="measure mt-8 space-y-5 text-onink-dim">
              <p>
                A visible fee helps you judge basic fit. A recommendation helps
                you avoid paying for more support than you actually need. You
                deserve both.
              </p>
              <p>
                Finish the assessment and your readiness map arrives with one
                recommended starting point and the reasoning behind it. You can
                compare that recommendation with every option shown above. It
                takes twelve minutes and costs nothing.
              </p>
              <p>
                If you would rather ask a person first, book a consultation. We
                will help you decide whether any programme is useful at all.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="The fee is clear. The right fit should be too."
        body="Begin with twelve private minutes and leave with one recommended next step—and the reasoning behind it."
      />
    </>
  );
}
