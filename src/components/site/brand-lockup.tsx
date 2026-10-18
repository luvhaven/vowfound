"use client";

import * as React from "react";
import { BRAND } from "@/lib/brand";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { VowMark } from "@/components/ui/ornament";

export function BrandLockup({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [managedLogoReady, setManagedLogoReady] = React.useState(false);
  const [managedLogoFailed, setManagedLogoFailed] = React.useState(false);

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden
        className="relative grid shrink-0 place-items-center"
        style={{ width: compact ? 34 : 40, height: compact ? 24 : 28 }}
      >
        {!managedLogoReady && (
          <VowMark size={compact ? 34 : 40} className="absolute inset-0" />
        )}
        {!managedLogoFailed && (
          <Image
            src="/api/brand/logo"
            alt=""
            fill
            unoptimized
            onLoad={() => setManagedLogoReady(true)}
            onError={() => setManagedLogoFailed(true)}
            className={cn(
              "relative z-[1] object-contain transition-opacity duration-200",
              managedLogoReady ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </span>
      <span className="display text-[1.35rem] tracking-tight md:text-[1.5rem]">
        {BRAND}
      </span>
    </span>
  );
}
