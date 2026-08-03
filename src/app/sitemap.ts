import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { LEGAL_DOCS } from "@/content/legal";
import { listPublishedArticles } from "@/lib/content.server";

/** Public marketing routes only. No member page, profile or result appears
 *  here, and none ever will — there is no code path that adds one. */
const PUBLIC_ROUTES = [
  "",
  "/how-it-works",
  "/services",
  "/method",
  "/matchmaking",
  "/coaching",
  "/plans",
  "/for-men",
  "/for-women",
  "/stories",
  "/experts",
  "/safety",
  "/privacy",
  "/faq",
  "/journal",
  "/book",
  "/contact",
  "/assessment",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublishedArticles();

  return [
    ...PUBLIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      priority: route === "" ? 1 : 0.7,
    })),
    ...Object.keys(LEGAL_DOCS).map((doc) => ({
      url: `${SITE_URL}/legal/${doc}`,
      lastModified: new Date(),
      priority: 0.3,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/journal/${article.slug}`,
      lastModified: article.published_at
        ? new Date(article.published_at)
        : new Date(),
      priority: 0.5,
    })),
  ];
}
