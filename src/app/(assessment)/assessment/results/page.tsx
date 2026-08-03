import type { Metadata } from "next";
import { ResultsClient } from "@/components/assessment/results-client";
import { resolveCurrency } from "@/lib/currency.server";
import { getReadinessMapForSession } from "@/lib/assessment/read.server";

export const metadata: Metadata = {
  title: "Your readiness map",
  // A results page is personal. It is never indexed and never previewed.
  robots: { index: false, follow: false, nocache: true },
};

export default async function ResultsPage() {
  const [currency, serverMap] = await Promise.all([
    resolveCurrency(),
    getReadinessMapForSession(),
  ]);

  return <ResultsClient currency={currency} serverMap={serverMap} />;
}
