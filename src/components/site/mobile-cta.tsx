"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const HIDDEN = ["/check", "/checkout", "/results", "/sign-in", "/sign-up", "/account", "/admin", "/private"];

/** A thumb-reach bar on phones, shown once the hero's own button has scrolled
 *  away and hidden near the footer, where the page's last CTA takes over. */
export function MobileCta() {
  const pathname = usePathname();
  const [show, setShow] = React.useState(false);
  const hidden = HIDDEN.some((p) => pathname.startsWith(p));

  React.useEffect(() => {
    if (hidden) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setShow(scrollY > 640 && scrollY < max - 900);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [hidden]);

  if (hidden) return null;
  return (
    <div
      className={cn(
        "no-print fixed inset-x-3 bottom-3 z-40 transition-transform duration-500 ease-[var(--ease-pop)] md:hidden",
        show ? "translate-y-0" : "translate-y-[150%]",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!show}
    >
      <div className="flex items-center gap-3 rounded-full border-2 border-ink bg-ink p-2 pl-5 text-paper shadow-[4px_4px_0_#ff4f2b]">
        <p className="min-w-0 flex-1 text-[14px] font-bold leading-tight">
          Free · 10 min · instant results
        </p>
        <Link href="/check" tabIndex={show ? 0 : -1} className="btn min-h-11 shrink-0 bg-butter px-5 text-[15px] text-ink shadow-none">
          Start
        </Link>
      </div>
    </div>
  );
}
