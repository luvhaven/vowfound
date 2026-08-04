"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/assessments", label: "Assessments" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/safety", label: "Safety" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/content/copy", label: "Site copy" },
  { href: "/admin/content", label: "Journal" },
  { href: "/admin/audit", label: "Audit log" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="overflow-x-auto lg:sticky lg:top-8 lg:self-start lg:overflow-visible"
    >
      <p className="engraved mb-4 hidden text-onink-faint lg:block">Workspace</p>
      <ul className="flex min-w-max gap-1 border-b border-hairline pb-3 lg:min-w-0 lg:flex-col lg:border-b-0 lg:border-l lg:pb-0 lg:pl-3">
        {LINKS.map((link) => {
          // Exact for the two links that are prefixes of another, so
          // /admin/content/copy does not light up "Journal" as well.
          const exact = link.href === "/admin" || link.href === "/admin/content";
          const active = exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "engraved block whitespace-nowrap rounded-[8px] px-4 py-3 transition-[color,background-color,transform] hover:translate-x-0.5",
                  active
                    ? "bg-onink/[0.09] text-onink"
                    : "text-onink-faint hover:bg-onink/[0.04] hover:text-onink-dim",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
