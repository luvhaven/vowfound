import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import type { AudiencePage } from "@/content/audiences";

export function AudienceLayout({ page }: { page: AudiencePage }) {
  return (
    <>
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        standfirst={page.standfirst}
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="READ"
              eyebrow="What may be happening"
              title="Specific patterns deserve specific language."
            />
          </Reveal>

          <ol className="mt-14 border-b border-hairline">
            {page.obstacles.map((item, index) => (
              <Reveal as="li" key={item.title} delay={(index % 3) * 50}>
                <article className="group grid gap-5 border-t border-hairline py-8 md:grid-cols-[4rem_0.82fr_1.18fr] md:gap-9 md:py-10">
                  <p className="numeral display text-[2.25rem] leading-none text-onink-faint transition-colors group-hover:text-rose">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="display text-[1.4rem] leading-snug text-onink">
                    {item.title}
                  </h2>
                  <p className="text-[16px] leading-relaxed text-onink-dim">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="wide">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <p className="engraved text-rose">The boundary</p>
                <h2 className="display-lg mt-6 text-onink">{page.closing.heading}</h2>
              </div>
              <div className="measure space-y-5 border-l border-hairline pl-7 text-onink-dim lg:col-span-6 lg:col-start-7 lg:pl-10">
                {page.closing.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="The assessment asks everyone the same questions."
        body="What changes is what your answers reveal, and which intervention would genuinely help."
        plan={{ slug: "clarity-audit", label: "See fees and start" }}
      />
    </>
  );
}
