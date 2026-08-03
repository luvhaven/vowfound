"use client";

import * as React from "react";
import Link from "next/link";
import { ReadinessMapView } from "./readiness-map";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import type { ReadinessMap } from "@/lib/assessment/scoring";
import type { Currency } from "@/lib/products";
import { VowMark } from "@/components/ui/ornament";

const RESULT_KEY = "vf.readiness.v1";
const STORAGE_KEY = "vf.assessment.v1";

export function ResultsClient({
  currency,
  serverMap,
}: {
  currency: Currency;
  serverMap: ReadinessMap | null;
}) {
  const [map, setMap] = React.useState<ReadinessMap | null>(serverMap);
  const [name, setName] = React.useState<string | undefined>();
  const [checked, setChecked] = React.useState(Boolean(serverMap));

  // Same as the runner: a one-time read of the locally stored run, which
  // cannot happen during render without a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    try {
      const savedRun = window.localStorage.getItem(STORAGE_KEY);
      if (savedRun) {
        const parsed = JSON.parse(savedRun) as {
          answers?: Record<string, unknown>;
        };
        const n = parsed.answers?.contact_name;
        if (typeof n === "string" && n.trim()) setName(n.trim());
      }

      if (!serverMap) {
        const raw = window.localStorage.getItem(RESULT_KEY);
        if (raw) setMap(JSON.parse(raw) as ReadinessMap);
      }
    } catch {
      // Nothing recoverable locally; the empty state below handles it.
    }
    setChecked(true);
  }, [serverMap]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!checked) {
    return <div className="min-h-[50vh]" aria-busy="true" />;
  }

  if (!map) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Paper className="overflow-hidden">
          <div className="grid md:grid-cols-[0.38fr_1fr]">
            <div className="flex min-h-48 items-center justify-center border-b border-stone bg-stock-warm/70 p-8 md:border-b-0 md:border-r">
              <div className="text-center">
                <VowMark size={110} className="mx-auto opacity-70" />
                <p className="engraved mt-6 text-oxblood">Map unavailable</p>
              </div>
            </div>
            <div className="px-7 py-10 md:px-10 md:py-12">
              <h1 className="display-md text-ink">
                We could not find your readiness map on this device.
              </h1>
              <p className="mt-5 text-[16px] leading-relaxed text-slate">
                Maps are tied to the browser you used, or to your account once
                you have one. If you finished the assessment somewhere else,
                sign in and it will be waiting.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/assessment">Take the assessment</Link>
                </Button>
                <Button asChild variant="onpaper">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    );
  }

  return <ReadinessMapView map={map} currency={currency} name={name} />;
}
