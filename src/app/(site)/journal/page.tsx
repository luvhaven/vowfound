import Link from "next/link";
import { Container, Section } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { listPublishedArticles } from "@/lib/content.server";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Journal",
  description:
    "Notes on readiness, positioning, and what actually decides whether a marriage holds.",
  path: "/journal",
});

export const revalidate = 300;

export default async function JournalPage() {
  const articles = await listPublishedArticles();

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="Notes from the practice."
        standfirst="Written by the people doing the work, about the patterns we keep seeing. No listicles, and nothing written to rank."
      />

      <Section>
        <Container width="default">
          {articles.length === 0 ? (
            <Reveal>
              <Paper className="px-7 py-10 md:px-12">
                <h2 className="display-md text-ink">
                  Nothing published yet.
                </h2>
                <p className="mt-5 text-[16px] leading-relaxed text-slate">
                  Rather than fill this page to make the site look established,
                  it stays empty until there is something worth your time. The
                  first pieces will be about the four positioning questions
                  clients raise most, because those are the conversations we
                  have every week.
                </p>
              </Paper>
            </Reveal>
          ) : (
            <ol className="space-y-px">
              {articles.map((article, i) => (
                <Reveal as="li" key={article.slug} delay={(i % 3) * 50}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="group grid gap-5 border-t border-hairline py-9 transition-[padding,background-color] duration-300 hover:bg-white/[0.025] md:grid-cols-[3.5rem_1fr_10rem] md:px-0 md:hover:px-5"
                  >
                    <p className="numeral engraved pt-1 text-rose">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <div>
                      <h2 className="display text-[1.5rem] text-onink transition-colors group-hover:text-white">
                        {article.title}
                      </h2>
                      {article.standfirst && (
                        <p className="measure mt-3 text-[16px] leading-relaxed text-onink-dim">
                          {article.standfirst}
                        </p>
                      )}
                    </div>
                    <p className="engraved text-onink-faint md:text-right">
                      {article.reading_minutes
                        ? `${article.reading_minutes} min`
                        : "Read"}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ol>
          )}
        </Container>
      </Section>

      <PageCta
        title="The assessment is more useful than any article here."
        body="It is specific to you, it takes twelve minutes, and it costs nothing."
      />
    </>
  );
}
