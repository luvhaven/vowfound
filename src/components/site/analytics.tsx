"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/**
 * Page views on every route change, and a click event for any link to the
 * check, checkout or private application — the doors into the funnel —
 * without wiring each button by hand.
 */
export function Analytics() {
  const pathname = usePathname();

  React.useEffect(() => {
    track("page_view");
  }, [pathname]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (/^\/(check|checkout\/|private#apply|pricing)/.test(href)) {
        track("cta_click", { to: href.slice(0, 60), label: (a.textContent ?? "").trim().slice(0, 60) });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
