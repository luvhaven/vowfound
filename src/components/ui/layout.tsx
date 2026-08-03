import * as React from "react";
import { cn } from "@/lib/utils";

/** Single column, centred, wide margins. Asymmetry comes from where the
 *  cards sit against the type — never from a three-column grid. */
export function Container({
  className,
  width = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  width?: "narrow" | "default" | "wide";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-10 xl:px-12",
        width === "narrow" && "max-w-2xl",
        width === "default" && "max-w-4xl",
        width === "wide" && "max-w-7xl",
        className,
      )}
      {...props}
    />
  );
}

export function Section({
  className,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={cn("relative py-24 md:py-32 lg:py-36", className)}
      {...props}
    >
      {children}
    </section>
  );
}

/** The engraved eyebrow. Sets the register for every section. */
export function Eyebrow({
  className,
  children,
  rule = true,
}: {
  className?: string;
  children: React.ReactNode;
  rule?: boolean;
}) {
  return (
    <p className={cn("engraved flex items-center gap-4 text-onink-faint", className)}>
      {rule && <span aria-hidden className="h-px w-8 bg-current opacity-60" />}
      <span>{children}</span>
    </p>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
  index,
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  index?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-7 border-t border-hairline pt-7 md:grid-cols-[6rem_1fr] md:gap-10",
        className,
      )}
    >
      <p className="numeral engraved text-rose">{index ?? "VF"}</p>
      <div className="max-w-3xl">
        <p className="engraved text-onink-faint">{eyebrow}</p>
        <h2 className="display-lg mt-5 text-onink">{title}</h2>
        {body && (
          <p className="measure mt-6 text-[17px] leading-relaxed text-onink-dim">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}
