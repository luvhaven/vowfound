import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout";
import { PageCta, PageHeader } from "@/components/site/page-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getArticle } from "@/lib/content.server";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import { BRAND, SITE_URL } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not found" };
  const url = absoluteUrl(`/journal/${article.slug}`);
  const description = article.standfirst ?? undefined;
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: BRAND,
      title: article.title,
      description,
      url,
      publishedTime: article.published_at ?? undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      images: ["/images/vowfound-commitment.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: ["/images/vowfound-commitment.png"],
    },
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

  const articleUrl = absoluteUrl(`/journal/${article.slug}`);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Journal", path: "/journal" },
          { name: article.title, path: `/journal/${article.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.standfirst,
          datePublished: article.published_at,
          dateModified: article.published_at,
          mainEntityOfPage: articleUrl,
          image: absoluteUrl("/images/vowfound-commitment.png"),
          author: {
            "@type": article.author_name ? "Person" : "Organization",
            name: article.author_name ?? BRAND,
          },
          publisher: { "@id": `${SITE_URL}/#organization` },
          inLanguage: "en",
        }}
      />
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
