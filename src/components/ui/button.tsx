import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "paper" | "quiet" | "onpaper";
type Size = "sm" | "md" | "lg";

const base =
  "engraved relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[8px] border " +
  "transition-[color,background-color,border-color,box-shadow,transform] duration-300 select-none " +
  "hover:-translate-y-0.5 active:translate-y-px active:scale-[0.99] " +
  "disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  // Oxblood. One per screen, maximum.
  primary:
    "border-oxblood-lift/60 bg-oxblood text-stock shadow-[0_12px_34px_rgba(91,25,49,0.24),inset_0_1px_rgba(255,255,255,0.12)] hover:bg-oxblood-lift hover:shadow-[0_16px_40px_rgba(91,25,49,0.32),inset_0_1px_rgba(255,255,255,0.14)]",
  // A card of stock on the dark field.
  paper:
    "border-white/70 bg-stock text-ink shadow-[0_12px_30px_rgba(7,4,10,0.16),inset_0_1px_white] hover:bg-white",
  // Foil hairline on the dark field.
  quiet:
    "border-onink/22 bg-onink/[0.025] text-onink shadow-[inset_0_1px_rgba(255,255,255,0.04)] hover:border-onink/45 hover:bg-onink/[0.07]",
  // Ink outline, used inside paper cards.
  onpaper:
    "border-ink/22 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-stock",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5",
  md: "h-12 px-7",
  lg: "h-14 px-8",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", asChild, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
