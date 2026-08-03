"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Readiness" },
  { href: "/account/appointments", label: "Appointments" },
  { href: "/account/billing", label: "Billing" },
  { href: "/account/privacy", label: "Privacy" },
  { href: "/account/security", label: "Security" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="overflow-x-auto rounded-[12px] border border-hairline bg-onink/[0.025] p-1.5"
    >
      <ul className="flex min-w-max gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "engraved block whitespace-nowrap rounded-[8px] px-5 py-3 transition-[color,background-color]",
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
