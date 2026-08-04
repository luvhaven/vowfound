import type { Metadata } from "next";
import { ALL_SERVICES } from "@/content/services";
import { BRAND, SITE_URL, TAGLINE } from "@/lib/brand";

const DEFAULT_IMAGE = "/images/vowfound-hero.png";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: BRAND,
      title,
      description,
      url,
      images: [{ url: image, width: 1536, height: 1024, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/api/brand/logo"),
    },
    description:
      "A private marriage-readiness, coaching and curated-matchmaking practice for adults who intend to marry.",
    slogan: TAGLINE,
    email: "hello@vowfound.com",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND,
    description: TAGLINE,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

export function breadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "VowFound marriage services",
    itemListElement: ALL_SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        description: service.detail,
        url: absoluteUrl(service.href),
        provider: { "@id": `${SITE_URL}/#organization` },
        audience: {
          "@type": "Audience",
          audienceType: "Adults intending to marry",
        },
      },
    })),
  };
}
