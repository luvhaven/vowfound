import { BRAND } from "@/lib/brand";
import { VowMark } from "@/components/ui/ornament";
import { cn } from "@/lib/utils";

export function BrandLockup({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <VowMark size={compact ? 34 : 40} />
      <span className="display text-[1.35rem] tracking-tight md:text-[1.5rem]">
        {BRAND}
      </span>
    </span>
  );
}
