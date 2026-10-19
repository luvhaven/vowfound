import type { Metadata } from "next";
import { LocalResults } from "./local-results";
import { resolveCurrency } from "@/lib/currency.server";

export const metadata: Metadata = { title: "Your results", robots: { index: false, follow: false } };

export default async function HereResultsPage() {
  return <LocalResults currency={await resolveCurrency()} />;
}
