import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { defaultFor } from "./registry";

/** Purged by name the moment an editor saves. */
export const CONTENT_TAG = "site-content";

/**
 * Site copy is public data, so this deliberately does NOT use the
 * cookie-backed session client. Reading cookies would opt every marketing
 * page into per-request rendering, and during static prerendering the cookie
 * client throws — which a defensive catch turns into "no overrides", so the
 * page builds fine and silently ignores every edit.
 */
/**
 * The query itself, cached in Next's data cache under CONTENT_TAG so a save
 * can purge it precisely. An interval alone is the wrong tool here: it would
 * mean an editor waits out a window before their change appears, and a build
 * that could not reach the database would serve defaults until it expired.
 *
 * Returns an array because the data cache serialises its value — a Map does
 * not survive the round trip.
 */
const fetchOverrides = unstable_cache(
  async (): Promise<[string, string][]> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];

    try {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await supabase
        .from("site_content")
        .select("key, value");

      if (error) {
        // Worth knowing about: the site still renders its defaults, but every
        // edit is being ignored, and that is invisible from the page itself.
        console.error("[content] override read failed:", error.message);
        return [];
      }

      return (data ?? []).map((row) => [row.key, row.value] as [string, string]);
    } catch (error) {
      console.error("[content] override read threw:", error);
      return [];
    }
  },
  [CONTENT_TAG],
  { tags: [CONTENT_TAG], revalidate: 60 },
);

/** Deduplicated per render, so thirty lookups make one cache read. */
export const getContentMap = cache(async (): Promise<Map<string, string>> => {
  return new Map(await fetchOverrides());
});

export type Content = (key: string) => string;

/**
 * Returns a lookup bound to this render.
 *
 *   const t = await getContent();
 *   <h1>{t("home.hero.title.line1")}</h1>
 */
export async function getContent(): Promise<Content> {
  const overrides = await getContentMap();
  return (key: string) => {
    const value = overrides.get(key);
    return value !== undefined && value.trim() !== "" ? value : defaultFor(key);
  };
}
