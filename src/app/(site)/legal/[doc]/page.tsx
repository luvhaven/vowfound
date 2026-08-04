import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout";
import { PageHeader } from "@/components/site/page-header";
import { LEGAL_DOCS, type LegalSlug } from "@/content/legal";
import { createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const entry = LEGAL_DOCS[doc as LegalSlug];
  if (!entry) return { title: "Not found" };
  return createPageMetadata({
    title: entry.title,
    description: entry.standfirst,
    path: `/legal/${doc}`,
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const entry = LEGAL_DOCS[doc as LegalSlug];
  if (!entry) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={entry.title}
        standfirst={entry.standfirst}
      />
      <Section>
        <Container width="default">
          <div className="border-t border-hairline">
            {entry.sections.map((section, index) => (
              <section
                key={section.heading}
                className="grid gap-6 border-b border-hairline py-10 md:grid-cols-[3rem_minmax(12rem,0.65fr)_1.35fr] md:gap-10 md:py-14"
              >
                <p className="numeral engraved text-rose">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="display-md text-onink">{section.heading}</h2>
                <div className="space-y-4 text-[16px] leading-relaxed text-onink-dim">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <p className="engraved text-onink-faint">VowFound legal register</p>
            <p className="engraved text-onink-faint">
              Last reviewed {entry.reviewed}
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
