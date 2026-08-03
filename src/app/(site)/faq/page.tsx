import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { FaqList } from "@/components/site/faq-list";
import { resolvedObjections } from "@/lib/content/resolve.server";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "Whether this is matchmaking, whether we can guarantee anything, and what happens if you are not ready.",
};

export default async function FaqPage() {
  const objections = await resolvedObjections();

  return (
    <>
      <PageHeader
        eyebrow="Reasonable questions"
        title="The ones people actually ask, answered plainly."
        standfirst="If yours is not here, ask it on the contact page and we will add it."
      />
      <Section>
        <Container width="default">
          <FaqList items={objections} />
        </Container>
      </Section>
      <PageCta
        title="The assessment answers most of the rest."
        body="Twelve minutes, and you will know within one screen whether we know what we are talking about."
      />
    </>
  );
}
