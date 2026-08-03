import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout";
import { PageCta, PageHeader } from "@/components/site/page-header";
import { getArticle } from "@/lib/content.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title,
    description: article.standfirst ?? undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <article>
        <PageHeader
          eyebrow="Journal / Field note"
          title={article.title}
          standfirst={article.standfirst ?? undefined}
        >
            <p className="engraved mt-9 text-onink-faint">
              {[
                article.author_name,
                article.reading_minutes
                  ? `${article.reading_minutes} min`
                  : null,
              ]
                .filter(Boolean)
                .join(" / ")}
            </p>
        </PageHeader>

        <Section>
          <Container width="narrow">
            <div className="space-y-6 text-lg leading-relaxed text-onink-dim">
              {article.body_md
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </Container>
        </Section>
      </article>

      <PageCta
        title="Reading about it is not the same as being told."
        body="The assessment gives you the version of this that is specific to your situation."
      />
    </>
  );
}
