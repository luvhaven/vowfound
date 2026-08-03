"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react";
import { BRAND, CONTACT_EMAIL } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/site/brand-lockup";

const NEXT_PATHS = [
  {
    number: "01",
    label: "Begin",
    body: "Build your private readiness map",
    href: "/assessment",
  },
  {
    number: "02",
    label: "Understand",
    body: "Read the five-stage method",
    href: "/method",
  },
  {
    number: "03",
    label: "Choose",
    body: "See every service and programme",
    href: "/services",
  },
] as const;

const UTILITY_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/plans", label: "Plans" },
  { href: "/journal", label: "Journal" },
  { href: "/stories", label: "Stories" },
  { href: "/safety", label: "Safety" },
  { href: "/faq", label: "Questions" },
  { href: "/contact", label: "Contact" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy-policy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/complaints", label: "Complaints" },
] as const;

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/checkout/")) {
    return (
      <footer className="border-t border-hairline bg-ink-deep">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-8 text-[12px] text-onink-faint sm:flex-row sm:items-center sm:justify-between md:px-10">
          <p>Private checkout. Payment details are handled by our payment provider.</p>
          <nav aria-label="Checkout support" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/legal/terms" className="transition-colors hover:text-onink">Terms</Link>
            <Link href="/legal/privacy-policy" className="transition-colors hover:text-onink">Privacy</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-onink">Need help?</a>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-hairline bg-ink-deep">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <BrandLockup className="gap-4 text-onink [&_svg]:w-[54px] [&_span]:text-[2rem]" />
            <h2 className="display-lg mt-8 max-w-3xl text-onink">
              Get married on purpose.
            </h2>
            <p className="mt-6 max-w-xl text-onink-dim">
              Private readiness work and curated introductions for adults who
              intend to marry.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-10 lg:justify-self-end">
            <Button asChild size="lg">
              <Link href="/assessment">Begin your plan</Link>
            </Button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-6 block text-sm text-onink-dim underline decoration-onink-faint underline-offset-8 transition-colors hover:text-onink"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <nav aria-label="Choose your next step" className="mt-16 border-y border-hairline">
          <ol className="grid lg:grid-cols-3">
            {NEXT_PATHS.map((path) => (
              <li key={path.href} className="border-b border-hairline last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                <Link
                  href={path.href}
                  className="group grid min-h-36 grid-cols-[2.5rem_1fr_auto] items-start gap-4 px-2 py-8 transition-[background-color,padding] duration-300 hover:bg-onink/[0.025] sm:px-5 lg:px-7 lg:hover:px-9"
                >
                  <span className="numeral engraved mt-1 text-rose">{path.number}</span>
                  <span>
                    <span className="engraved text-onink-faint">{path.label}</span>
                    <span className="display mt-3 block max-w-xs text-[1.35rem] leading-tight text-onink">
                      {path.body}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="mt-1 size-4 text-onink-faint transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rose"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <nav aria-label="Explore">
            <ul className="flex max-w-3xl flex-wrap gap-x-7 gap-y-3">
              {UTILITY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-onink-dim transition-colors hover:text-onink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-onink-faint transition-colors hover:text-onink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-hairline pt-7 text-[12px] leading-relaxed text-onink-faint">
          © {new Date().getFullYear()} {BRAND}. We guarantee the work, not a
          marriage.
        </p>
      </div>
    </footer>
  );
}
