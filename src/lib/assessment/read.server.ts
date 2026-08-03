import "server-only";
import { cookies } from "next/headers";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { DIMENSIONS } from "./dimensions";
import type { Band } from "./dimensions";
import type { ReadinessMap } from "./scoring";

const ANON_COOKIE = "vf_assessment";

interface StoredBand {
  band: Band;
  note: string;
  first_action: string | null;
}

/**
 * The authoritative copy of a map, keyed by the anonymous run cookie. The
 * client keeps a local copy so the page still works offline, but this one
 * wins when both exist.
 */
export async function getReadinessMapForSession(): Promise<ReadinessMap | null> {
  if (!supabaseConfigured()) return null;

  const store = await cookies();
  const key = store.get(ANON_COOKIE)?.value;
  if (!key) return null;

  const db = createAdminClient();

  const { data: assessment } = await db
    .from("assessments")
    .select("id")
    .eq("anon_key", key)
    .maybeSingle();

  if (!assessment) return null;

  const { data: result } = await db
    .from("readiness_results")
    .select(
      "bands, strengths, obstacles, recommended_product, summary, engine_version",
    )
    .eq("assessment_id", assessment.id)
    .maybeSingle();

  if (!result) return null;

  const bands = (result.bands ?? {}) as Record<string, StoredBand>;

  return {
    dimensions: DIMENSIONS.filter((d) => bands[d.key]).map((d) => ({
      key: d.key,
      name: d.name,
      band: bands[d.key].band,
      note: bands[d.key].note,
      firstAction: bands[d.key].first_action,
    })),
    strengths: result.strengths ?? [],
    obstacles: result.obstacles ?? [],
    recommendedProduct: result.recommended_product ?? "clarity-audit",
    summary: result.summary ?? "",
    engineVersion: result.engine_version ?? "v1",
  };
}
