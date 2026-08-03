"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMotionValueEvent, useScroll } from "motion/react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VowMark } from "@/components/ui/ornament";
import { BrandLockup } from "@/components/site/brand-lockup";
import {
  ALL_SERVICES,
  CORE_SERVICES,
  SPECIALIST_SERVICES,
  type ServiceIcon,
  type ServiceOffering,
} from "@/content/services";
import {
  ArrowUpRight,
  Camera,
  CaretDown,
  ChatsCircle,
  ChatTeardropText,
  ClipboardText,
  CrownSimple,
  ShieldCheck,
  Sparkle,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";

const PRIMARY_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/plans", label: "Plans" },
];

const SERVICE_ICONS = {
  audit: ClipboardText,
  coaching: ChatsCircle,
  matchmaking: UsersThree,
  concierge: CrownSimple,
  style: Sparkle,
  photography: Camera,
  verification: ShieldCheck,
  advisor: ChatTeardropText,
} satisfies Record<ServiceIcon, Icon>;

const SUPPORTING_LINKS = [
  { href: "/method", label: "Our method" },
  { href: "/safety", label: "Safety & privacy" },
  { href: "/journal", label: "Journal" },
] as const;

export function Header() {
  const pathname = usePathname();

  return <HeaderInner key={pathname} pathname={pathname} />;
}

function HeaderInner({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);

  // On the home page the hero already carries the ask, so the header CTA only
  // appears once the hero is behind you. Elsewhere it is always on.
  const isHome = pathname === "/";
  const [pastHero, setPastHero] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const past = y > window.innerHeight * 0.72;
    const hasScrolled = y > 12;
    setPastHero((current) => (current === past ? current : past));
    setScrolled((current) => (current === hasScrolled ? current : hasScrolled));
  });

  const showHeaderCta = !isHome || pastHero;
  const servicesRef = React.useRef<HTMLDivElement>(null);
  const servicesButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function closeServices(event: MouseEvent) {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && servicesOpen) {
        setServicesOpen(false);
        servicesButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeServices);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeServices);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [servicesOpen]);

  const servicesActive =
    pathname === "/services" ||
    ALL_SERVICES.some(
      (item) =>
        pathname === item.href.split("#")[0] ||
        pathname === item.actionHref.split(/[?#]/)[0],
    );

  if (pathname.startsWith("/checkout/")) {
    return (
      <header className="border-b border-hairline bg-ink/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-6 md:h-20 md:px-10">
          <Link href="/" aria-label={`${BRAND} home`} className="text-onink">
            <BrandLockup compact />
          </Link>
          <div className="flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-sage shadow-[0_0_0_4px_rgba(118,130,119,0.12)]" />
            <p className="engraved text-[9px] text-onink-faint sm:text-[10px]">
              Secure & confidential
            </p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-hairline backdrop-blur-xl transition-[background-color,box-shadow] duration-300",
        scrolled
          ? "bg-ink/[0.94] shadow-[0_16px_48px_rgba(7,4,10,0.24)]"
          : "bg-ink/[0.76]",
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-8 px-6 transition-[height] duration-300 md:px-10",
          scrolled ? "md:h-16" : "md:h-[4.5rem]",
        )}
      >
        <Link
          href="/"
          aria-label={`${BRAND} home`}
          className="group flex shrink-0 items-center gap-3 text-onink"
        >
          <BrandLockup className="transition-transform duration-500 group-hover:-translate-y-px" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          <Link
            href={PRIMARY_LINKS[0].href}
            aria-current={pathname === PRIMARY_LINKS[0].href ? "page" : undefined}
            className={cn(
              "engraved whitespace-nowrap text-[10px] tracking-[0.08em] transition-colors duration-200",
              pathname === PRIMARY_LINKS[0].href
                ? "text-rose"
                : "text-onink-dim hover:text-onink",
            )}
          >
            {PRIMARY_LINKS[0].label}
          </Link>

          <div ref={servicesRef} className="relative">
            <button
              ref={servicesButtonRef}
              type="button"
              onClick={() => setServicesOpen((value) => !value)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              aria-controls="services-panel"
              className={cn(
                "engraved flex items-center gap-1.5 whitespace-nowrap text-[10px] tracking-[0.08em] transition-colors duration-200",
                servicesActive || servicesOpen
                  ? "text-rose"
                  : "text-onink-dim hover:text-onink",
              )}
            >
              Services
              <CaretDown
                aria-hidden
                weight="regular"
                className={cn(
                  "size-3 transition-transform duration-300",
                  servicesOpen && "rotate-180",
                )}
              />
            </button>

            {servicesOpen && (
              <div
                id="services-panel"
                className="absolute left-1/2 top-full z-10 w-[min(55rem,calc(100vw-2.5rem))] -translate-x-1/2 pt-4"
              >
                <div className="services-menu-enter overflow-hidden rounded-[24px] border border-onink/12 bg-ink-raised shadow-[0_30px_90px_rgba(7,4,10,0.58)]">
                  <div className="grid grid-cols-[0.72fr_1.28fr]">
                    <div className="relative overflow-hidden border-r border-hairline bg-oxblood/15 p-7">
                      <VowMark
                        size={116}
                        className="ring-orbit pointer-events-none -bottom-5 -right-7 opacity-[0.18]"
                      />
                      <div className="relative flex h-full min-h-[18rem] flex-col">
                        <p className="engraved text-rose">Recommended first step</p>
                        <p className="display mt-5 text-[1.7rem] leading-[1.05] text-onink">
                          Know what would help before you buy it.
                        </p>
                        <p className="mt-5 text-[13px] leading-[1.7] text-onink-dim">
                          Twelve private minutes. One readiness map and one
                          recommended place to begin.
                        </p>
                        <div className="mt-auto pt-7">
                          <Button asChild size="sm">
                            <Link href="/assessment">Start free assessment</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-5 border-b border-hairline px-6 py-4">
                        <p className="engraved text-[9px] text-onink-faint">All marriage services</p>
                        <Link
                          href="/services"
                          className="group inline-flex items-center gap-2 text-[12px] font-medium text-onink transition-colors hover:text-rose"
                        >
                          View all
                          <ArrowUpRight
                            aria-hidden
                            className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2">
                        <ServiceMenuGroup
                          title="Core practice"
                          services={CORE_SERVICES}
                          pathname={pathname}
                        />
                        <ServiceMenuGroup
                          title="Specialist support"
                          services={SPECIALIST_SERVICES}
                          pathname={pathname}
                          className="border-l border-hairline"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 border-t border-hairline bg-ink-deep/45 px-7 py-4">
                    <p className="text-[12px] text-onink-faint">
                      Prefer to understand the approach first?
                    </p>
                    <div className="flex shrink-0 items-center gap-5">
                      {SUPPORTING_LINKS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="engraved text-[9px] text-onink-dim transition-colors hover:text-onink"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href={PRIMARY_LINKS[1].href}
            aria-current={pathname === PRIMARY_LINKS[1].href ? "page" : undefined}
            className={cn(
              "engraved whitespace-nowrap text-[10px] tracking-[0.08em] transition-colors duration-200",
              pathname === PRIMARY_LINKS[1].href
                ? "text-rose"
                : "text-onink-dim hover:text-onink",
            )}
          >
            {PRIMARY_LINKS[1].label}
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/sign-in"
            className="engraved hidden text-onink-dim transition-colors hover:text-onink sm:block"
          >
            Sign in
          </Link>
          {/* On the home page the hero already carries the ask, so this only
              appears once the hero is behind you. Elsewhere it is always on. */}
          <Button
            asChild
            size="sm"
            className={cn(
              "hidden transition-[opacity,transform] duration-300 sm:inline-flex",
              // visibility, not just opacity: an opacity-0 link still swallows
              // clicks meant for the hero and is still read by screen readers.
              !showHeaderCta &&
                "pointer-events-none invisible -translate-y-1 opacity-0",
            )}
          >
            <Link href="/assessment" tabIndex={showHeaderCta ? 0 : -1}>
              Start free assessment
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="engraved flex items-center gap-2 rounded-[8px] border border-onink/20 px-3.5 py-2.5 text-onink transition-colors hover:bg-onink/5 lg:hidden"
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span className={cn("absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300", open && "top-1.5 rotate-45")} />
              <span className={cn("absolute left-0 top-1.5 h-px w-full bg-current transition-opacity duration-300", open && "opacity-0")} />
              <span className={cn("absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300", open && "bottom-1.5 -rotate-45")} />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="mobile-menu-enter max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-hairline bg-ink/96 px-6 py-7 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Primary mobile" className="mx-auto flex max-w-2xl flex-col gap-7">
            <Link
              href="/assessment"
              className="group rounded-[16px] border border-rose/30 bg-rose/[0.07] p-5 transition-[background-color,border-color,transform] duration-300 hover:border-rose/55 hover:bg-rose/[0.11] active:scale-[0.99]"
            >
              <p className="engraved text-[9px] text-rose">Recommended first step</p>
              <span className="mt-3 flex items-end justify-between gap-5">
                <span>
                  <span className="display block text-[1.55rem] leading-tight text-onink">
                    Build your readiness map
                  </span>
                  <span className="mt-2 block text-[13px] text-onink-dim">
                    Free · twelve private minutes
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="mb-1 size-5 shrink-0 text-rose transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              {PRIMARY_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "display border-b border-hairline pb-4 text-[1.45rem] leading-none",
                    pathname === item.href ? "text-rose" : "text-onink-dim",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <MobileServiceGroup title="Core practice" services={CORE_SERVICES} />

            <details className="group border-t border-hairline pt-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span className="engraved text-[9px] text-rose">Specialist support</span>
                <span className="flex items-center gap-2 text-[11px] text-onink-faint">
                  {SPECIALIST_SERVICES.length} services
                  <CaretDown
                    aria-hidden
                    className="size-3 transition-transform duration-300 group-open:rotate-180"
                  />
                </span>
              </summary>
              <div className="mt-4">
                <MobileServiceGroup services={SPECIALIST_SERVICES} />
              </div>
            </details>

            <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-hairline pt-5">
              <Link
                href="/services"
                className="engraved text-[9px] text-rose"
              >
                All services
              </Link>
              {SUPPORTING_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="engraved text-[9px] text-onink-dim"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <hr className="hairline" />
            <div className="flex items-center justify-between gap-5">
              <Link
                href="/sign-in"
                className="engraved text-onink-dim transition-colors hover:text-onink"
              >
                Sign in
              </Link>
              <Link
                href="/contact"
                className="engraved text-onink-dim transition-colors hover:text-onink"
              >
                Contact
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function ServiceMenuGroup({
  title,
  services,
  pathname,
  className,
}: {
  title: string;
  services: readonly ServiceOffering[];
  pathname: string;
  className?: string;
}) {
  return (
    <div className={cn("p-4", className)}>
      <p className="engraved px-3 pb-2 text-[9px] text-onink-faint">{title}</p>
      <div className="grid gap-0.5">
        {services.map((service) => {
          const Icon = SERVICE_ICONS[service.icon];
          const baseHref = service.href.split("#")[0];
          const active = pathname === baseHref;

          return (
            <Link
              key={service.id}
              href={service.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group grid grid-cols-[1.75rem_1fr] gap-2.5 rounded-[10px] px-2.5 py-2.5 transition-[background-color,transform] duration-300 hover:translate-x-0.5 hover:bg-onink/5",
                active && "bg-onink/5",
              )}
            >
              <span className="mt-0.5 flex size-7 items-center justify-center rounded-full border border-onink/12 text-rose transition-colors group-hover:border-rose/45 group-hover:text-onink">
                <Icon aria-hidden className="size-3.5" weight="regular" />
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium leading-5 text-onink">
                    {service.shortName}
                  </span>
                  {service.availability !== "Available now" && (
                    <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.08em] text-onink-faint">
                      {service.availability}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileServiceGroup({
  title,
  services,
}: {
  title?: string;
  services: readonly ServiceOffering[];
}) {
  return (
    <div>
      {title && <p className="engraved mb-3 text-[9px] text-rose">{title}</p>}
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        {services.map((service) => {
          const Icon = SERVICE_ICONS[service.icon];
          return (
            <Link
              key={service.id}
              href={service.href}
              className="group rounded-[12px] border border-onink/10 bg-onink/[0.025] p-3 transition-colors hover:bg-onink/5"
            >
              <Icon aria-hidden className="size-4 text-rose" weight="regular" />
              <span className="mt-2 block text-[13px] font-medium leading-5 text-onink">
                {service.shortName}
              </span>
              {service.availability !== "Available now" && (
                <span className="mt-1 block text-[9px] uppercase tracking-[0.08em] text-onink-faint">
                  {service.availability}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
