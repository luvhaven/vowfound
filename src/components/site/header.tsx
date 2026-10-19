"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/art/shapes";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/matchmaking", label: "Matchmaking" },
  { href: "/coaching", label: "Coaching" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function Header({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  // The menu is open for the path it was opened on, so navigating closes it
  // without an effect.
  const [openOn, setOpenOn] = React.useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) =>
    setOpenOn((typeof next === "function" ? next(open) : next) ? pathname : null);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="no-print sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border-2 border-ink bg-paper pl-5 pr-2 transition-shadow duration-300",
          scrolled ? "shadow-[4px_4px_0_#1a1410]" : "shadow-none",
        )}
      >
        <Link href="/" aria-label="VowFound home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-semibold transition-colors hover:bg-butter",
                pathname.startsWith(link.href) && "bg-ink text-paper hover:bg-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={signedIn ? "/account" : "/sign-in"} className="hidden whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-semibold hover:bg-butter md:block">
            {signedIn ? "My account" : "Sign in"}
          </Link>
          <Link href="/check" className={cn("btn hidden min-h-12 bg-tomato px-5 text-[15px] text-ink shadow-[3px_3px_0_#1a1410] sm:inline-flex", pathname.startsWith("/check") && "sm:hidden")}>
            Free Readiness Check
          </Link>
          <button
            type="button"
            className="flex size-12 items-center justify-center rounded-full border-2 border-ink bg-butter xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-5" aria-hidden>
              <span className={cn("absolute left-0 top-0 h-0.5 w-5 bg-ink transition-transform duration-300", open && "translate-y-[5px] rotate-45")} />
              <span className={cn("absolute bottom-0 left-0 h-0.5 w-5 bg-ink transition-transform duration-300", open && "-translate-y-[5px] -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="pop-in fixed inset-x-3 top-[5.5rem] z-50 rounded-[28px] border-2 border-ink bg-cobalt p-6 text-paper shadow-[6px_6px_0_#1a1410] xl:hidden">
          <nav aria-label="Mobile" className="grid gap-1">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl px-3 py-3 font-display text-3xl font-extrabold tracking-[-0.04em] hover:bg-paper/10">
                {link.label}
              </Link>
            ))}
            <Link href={signedIn ? "/account" : "/sign-in"} className="rounded-2xl px-3 py-3 font-display text-3xl font-extrabold tracking-[-0.04em] hover:bg-paper/10">
              {signedIn ? "My account" : "Sign in"}
            </Link>
          </nav>
          <Link href="/check" className="btn btn-lg mt-6 w-full bg-butter text-ink">
            Take the free Readiness Check
          </Link>
        </div>
      )}
    </header>
  );
}
