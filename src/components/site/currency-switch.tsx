"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { setCurrency } from "@/app/actions/checkout";
import type { Currency } from "@/lib/products";
import { cn } from "@/lib/utils";

const NAME: Record<Currency, string> = { NGN: "naira", USD: "dollars" };

/**
 * Only one currency is ever rendered, and the alternative is named rather
 * than priced. The control is absent entirely where the region has no
 * choice — the naira price is a local price, not an option to opt into.
 */
export function CurrencySwitch({
  current,
  options,
}: {
  current: Currency;
  options: Currency[];
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const other = options.find((c) => c !== current);

  if (!other) {
    return (
      <p className="engraved text-slate">
        Billed in {NAME[current]}
      </p>
    );
  }

  function change() {
    setError(null);
    startTransition(async () => {
      const result = await setCurrency(other!);
      if (result && !result.ok) {
        setError("That currency is not available in your region.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="engraved text-slate">Billed in {NAME[current]}</span>
        <button
          type="button"
          onClick={change}
          disabled={pending}
          className={cn(
            "engraved rounded-[8px] border border-stone px-3 py-1.5 text-slate transition-colors",
            "hover:border-ink hover:text-ink disabled:opacity-50",
          )}
        >
          Switch to {NAME[other]}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-oxblood">
          {error}
        </p>
      )}
    </div>
  );
}
