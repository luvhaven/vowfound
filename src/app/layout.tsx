import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { BRAND, SITE_URL, TAGLINE } from "@/lib/brand";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["wdth", "opsz"],
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} — ${TAGLINE}`, template: `%s — ${BRAND}` },
  description:
    "VowFound is matchmaking and coaching for adults who want to get married. Take the free ten-minute Readiness Check, then meet people who want the same thing.",
  openGraph: {
    type: "website",
    siteName: BRAND,
    title: `${BRAND} — ${TAGLINE}`,
    description: "Less swiping. More forever. Free ten-minute Readiness Check.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fff6e9",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
