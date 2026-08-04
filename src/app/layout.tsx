import type { Metadata } from "next";
import "@fontsource/newsreader/latin-300.css";
import "@fontsource/newsreader/latin-300-italic.css";
import "@fontsource/newsreader/latin-400.css";
import "@fontsource/newsreader/latin-400-italic.css";
import "@fontsource/newsreader/latin-500.css";
import "@fontsource/newsreader/latin-500-italic.css";
import "@fontsource/newsreader/latin-600.css";
import "@fontsource/newsreader/latin-600-italic.css";
import "./globals.css";
import { switzer } from "@/lib/fonts";
import { BRAND, SITE_URL, TAGLINE } from "@/lib/brand";
import { FoilDefs } from "@/components/ui/ornament";
import { Analytics } from "@/components/analytics/analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} | ${TAGLINE}`,
    template: `%s | ${BRAND}`,
  },
  description:
    "A private marriage-readiness, coaching and curated-matchmaking practice for adults who intend to marry. No swiping. No public browsing. A human makes every introduction.",
  applicationName: BRAND,
  authors: [{ name: BRAND, url: SITE_URL }],
  creator: BRAND,
  publisher: BRAND,
  category: "Relationship services",
  keywords: [
    "marriage readiness",
    "private matchmaking",
    "relationship coaching",
    "marriage coaching",
    "curated introductions",
  ],
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [{ url: "/api/brand/favicon" }],
    shortcut: "/api/brand/favicon",
    apple: "/api/brand/apple-icon",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    siteName: BRAND,
    title: `${BRAND} | ${TAGLINE}`,
    description:
      "Tell us the future you want. We will help you understand what has been getting in the way, become ready for it, and meet people who share the intention.",
    images: [
      {
        url: "/images/vowfound-hero.png",
        width: 1536,
        height: 1024,
        alt: "A married couple sharing a quiet laugh at home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} | ${TAGLINE}`,
    description:
      "Private coaching and curated introductions for people ready for a lasting marriage.",
    images: ["/images/vowfound-hero.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${switzer.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-ink text-onink">
        <FoilDefs />
        <a
          href="#main"
          className="engraved sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-stock focus:px-4 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
