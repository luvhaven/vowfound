import Link from "next/link";
import { Mark, Sparkle } from "@/components/art/shapes";
import { CONTACT_EMAIL } from "@/lib/brand";

const COLUMNS = [
  {
    title: "Find",
    links: [
      { href: "/check", label: "Readiness Check" },
      { href: "/matchmaking", label: "Matchmaking" },
      { href: "/coaching", label: "Coaching" },
      { href: "/pricing", label: "Pricing" },
      { href: "/private", label: "Private" },
    ],
  },
  {
    title: "Know",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/safety", label: "Safety & privacy" },
      { href: "/faq", label: "Questions" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Small print",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/refunds", label: "Refunds" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="no-print mt-auto bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-3 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
          <div className="md:col-span-3 lg:col-span-1">
            <p className="h2 max-w-md text-[clamp(2rem,3.6vw,3.25rem)]">
              Somewhere, someone is <span className="say text-butter">also</span> done with dating apps.
            </p>
            <Link href="/check" className="btn btn-lg mt-8 bg-butter text-ink shadow-[4px_4px_0_#fff6e9]">
              Start the free check
            </Link>
            <p className="mt-6 text-[15px] text-paper/70">
              Questions? <a className="underline underline-offset-4 hover:text-butter" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="label text-paper/50">{col.title}</p>
              <ul className="mt-5 grid gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[16px] font-semibold hover:text-butter">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="relative mt-20 select-none overflow-hidden" aria-hidden>
          <p className="font-display text-[clamp(4rem,19vw,17rem)] font-extrabold leading-[0.8] tracking-[-0.07em] text-tomato">
            vowfound
          </p>
          <Sparkle fill="butter" className="spin-slow absolute right-[6%] top-[8%] w-[7vw] max-w-20" />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-paper/20 pt-6 text-[13px] text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3">
            <Mark size={18} /> © {new Date().getFullYear()} VowFound. Made for people who mean it.
          </p>
          <p>No one can promise you a marriage. Be wary of anyone who does.</p>
        </div>
      </div>
    </footer>
  );
}
