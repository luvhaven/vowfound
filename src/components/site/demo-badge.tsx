import { cn } from "@/lib/utils";

/**
 * Seed data is demonstration content and must be visibly distinguishable in
 * the UI. Any record carrying is_demo must render this. There is no variant
 * that hides it.
 */
export function DemoBadge({
  className,
  tone = "paper",
}: {
  className?: string;
  tone?: "paper" | "ink";
}) {
  return (
    <span
      className={cn(
        "engraved inline-flex items-center gap-2 rounded-[8px] border px-2 py-1 text-[10px] md:text-[11px]",
        tone === "paper"
          ? "border-stone bg-stock-warm text-slate"
          : "border-hairline text-onink-faint",
        className,
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      Demonstration content
    </span>
  );
}

export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-dashed border-stone bg-stock-warm px-5 py-4">
      <DemoBadge />
      <p className="mt-3 text-[15px] leading-relaxed text-slate">
        {children ??
          "These records are placeholders for layout and testing. They are not real clients, real outcomes or real statistics, and they are never shown to the public."}
      </p>
    </div>
  );
}
