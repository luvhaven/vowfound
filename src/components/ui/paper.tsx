import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A card of cotton stock on the dark field. The only surface that may carry
 * --stock. Never use as a page background.
 */
export function Paper({
  className,
  foil = true,
  as: Comp = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  foil?: boolean;
  as?: React.ElementType;
}) {
  return (
    <Comp
      className={cn(
        "paper relative rounded-[24px]",
        foil && "foil-edge",
        className,
      )}
      {...props}
    />
  );
}

/** A recessed inset within a paper card — a second paper weight. */
export function PaperInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-stone/80 bg-stock-warm/80 p-5 shadow-[inset_0_1px_rgba(255,255,255,0.62)]",
        className,
      )}
      {...props}
    />
  );
}
