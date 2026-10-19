import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultsView } from "@/components/check/results-view";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { resolveCurrency } from "@/lib/currency.server";
import type { Scores } from "@/lib/readiness";

export const metadata: Metadata = { title: "Your results", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* The id is an unguessable UUID and works like a private share link. */
export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id) || !adminConfigured()) notFound();

  const { data } = await createAdminClient()
    .from("readiness_checks")
    .select("scores, recommended, first_name")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <ResultsView
      scores={data.scores as Scores}
      recommended={data.recommended}
      firstName={data.first_name}
      currency={await resolveCurrency()}
    />
  );
}
