import { BRAND } from "@/lib/brand";
import Image from "next/image";
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
      <Image
        src="/api/brand/logo"
        alt=""
        aria-hidden
        width={compact ? 34 : 40}
        height={compact ? 24 : 28}
        unoptimized
        className="object-contain"
      />
      <span className="display text-[1.35rem] tracking-tight md:text-[1.5rem]">
        {BRAND}
      </span>
    </span>
  );
}
