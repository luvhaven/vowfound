"use client";

import * as React from "react";
import Link from "next/link";
import { ResultsView } from "@/components/check/results-view";
import { LOCAL_KEY } from "@/components/check/runner";
import { recommend, score } from "@/lib/readiness";
import type { Currency } from "@/lib/products";

/** Results computed in this browser, for when they could not be stored. */
export function LocalResults({ currency }: { currency: Currency }) {
  const raw = React.useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(LOCAL_KEY);
      } catch {
        return null;
      }
    },
    () => undefined,
  );
  const data = React.useMemo<{ answers: Record<string, number>; firstName: string } | null | undefined>(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [raw]);

  if (data === undefined) return <div className="min-h-[60vh]" />;
  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="h2">No results in this browser yet.</h1>
        <Link href="/check" className="btn btn-lg mt-8 bg-tomato">Take the check</Link>
      </div>
    );
  }
  const scores = score(data.answers);
  return <ResultsView scores={scores} recommended={recommend(scores)} firstName={data.firstName} currency={currency} />;
}
