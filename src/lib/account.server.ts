import "server-only";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { DIMENSIONS, type Band } from "@/lib/assessment/dimensions";
import type { ReadinessMap } from "@/lib/assessment/scoring";

export interface MemberOverview {
  firstName?: string;
  map: ReadinessMap | null;
  enrolment: {
    programmeName: string;
    agreed: number | null;
    delivered: number;
  } | null;
}

interface StoredBand {
  band: Band;
  note: string;
  first_action: string | null;
}

/** Everything on the account landing page, read under the member's own RLS. */
export async function getMemberOverview(): Promise<MemberOverview> {
  if (!supabaseConfigured()) return { map: null, enrolment: null };

  const user = await getSessionUser();
  if (!user) return { map: null, enrolment: null };

  const supabase = await createClient();

  const [{ data: profile }, { data: result }, { data: enrolments }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("preferred_name, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("readiness_results")
        .select(
          "bands, strengths, obstacles, recommended_product, summary, engine_version",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("programme_enrolments")
        .select(
          "agreed_introductions, introductions_delivered, programmes(name)",
        )
        .eq("user_id", user.id)
        .in("status", ["active", "pending"])
        .limit(1),
    ]);

  const displayName = profile?.preferred_name ?? profile?.full_name ?? undefined;
  const firstName = displayName?.trim().split(/\s+/)[0];

  let map: ReadinessMap | null = null;
  if (result) {
    const bands = (result.bands ?? {}) as Record<string, StoredBand>;
    map = {
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

  const row = enrolments?.[0] as
    | {
        agreed_introductions: number | null;
        introductions_delivered: number;
        programmes: { name: string } | { name: string }[] | null;
      }
    | undefined;

  const programme = Array.isArray(row?.programmes)
    ? row?.programmes[0]
    : row?.programmes;

  return {
    firstName,
    map,
    enrolment: row
      ? {
          programmeName: programme?.name ?? "Your programme",
          agreed: row.agreed_introductions,
          delivered: row.introductions_delivered,
        }
      : null,
  };
}
