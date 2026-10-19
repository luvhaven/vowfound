import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wrap({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}

const FIELD = {
  paper: "bg-paper text-ink",
  "paper-deep": "bg-paper-deep text-ink",
  ink: "bg-ink text-paper",
  tomato: "bg-tomato text-ink",
  cobalt: "bg-cobalt text-paper",
  butter: "bg-butter text-ink",
  bubble: "bg-bubble text-ink",
  moss: "bg-moss text-paper",
  lilac: "bg-lilac text-ink",
} as const;

export type Field = keyof typeof FIELD;

/** A colour field. Every section on the site is one of these. */
export function Block({
  field = "paper",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { field?: Field }) {
  return (
    <section className={cn("relative overflow-hidden py-20 md:py-28", FIELD[field], className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label inline-flex items-center gap-2 rounded-full border-2 border-current px-3 py-1.5", className)}>
      {children}
    </p>
  );
}

export function CtaButton({
  href,
  children,
  tone = "tomato",
  size = "lg",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "tomato" | "butter" | "ink" | "paper" | "cobalt";
  size?: "md" | "lg";
  className?: string;
}) {
  const tones = {
    tomato: "bg-tomato text-ink",
    butter: "bg-butter text-ink",
    ink: "bg-ink text-paper",
    paper: "bg-paper text-ink",
    cobalt: "bg-cobalt text-paper",
  };
  return (
    <Link href={href} className={cn("btn", size === "lg" && "btn-lg", tones[tone], className)}>
      {children}
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function Tick({ className }: { className?: string }) {
  return (
    <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-butter", className)} aria-hidden>
      <svg viewBox="0 0 12 12" className="size-3">
        <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="#1a1410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  body,
  field = "paper",
  art,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  field?: Field;
  art?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Block field={field} className="pb-16 pt-12 md:pb-24 md:pt-20">
      <Wrap className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <Eyebrow className="pop-in">{eyebrow}</Eyebrow>
          <h1 className="h1 pop-in mt-6" style={{ "--d": "80ms" } as React.CSSProperties}>
            {title}
          </h1>
          {body && (
            <p className="pop-in mt-7 max-w-2xl text-[19px] leading-relaxed opacity-85 md:text-[21px]" style={{ "--d": "160ms" } as React.CSSProperties}>
              {body}
            </p>
          )}
          {children && (
            <div className="pop-in mt-9" style={{ "--d": "240ms" } as React.CSSProperties}>
              {children}
            </div>
          )}
        </div>
        {art && <div className="bob mx-auto w-full max-w-sm">{art}</div>}
      </Wrap>
    </Block>
  );
}
