import "server-only";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";

export type BrandAssets = {
  logo_url: string | null;
  favicon_url: string | null;
  apple_icon_url: string | null;
  updated_at: string | null;
};

export const DEFAULT_BRAND_ASSETS: BrandAssets = {
  logo_url: null,
  favicon_url: null,
  apple_icon_url: null,
  updated_at: null,
};

export async function getBrandAssets(): Promise<BrandAssets> {
  if (!supabaseConfigured()) return DEFAULT_BRAND_ASSETS;

  const db = createAdminClient();
  const { data, error } = await db
    .from("brand_assets")
    .select("logo_url,favicon_url,apple_icon_url,updated_at")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) return DEFAULT_BRAND_ASSETS;
  return data as BrandAssets;
}
