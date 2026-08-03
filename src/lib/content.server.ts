import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";

export interface ArticleSummary {
  slug: string;
  title: string;
  standfirst: string | null;
  reading_minutes: number | null;
  published_at: string | null;
}

export interface Article extends ArticleSummary {
  body_md: string;
  author_name: string | null;
}

/** Only published, non-demonstration articles ever leave this module. */
export async function listPublishedArticles(): Promise<ArticleSummary[]> {
  if (!supabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, title, standfirst, reading_minutes, published_at")
    .eq("status", "published")
    .eq("is_demo", false)
    .order("published_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!supabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(
      "slug, title, standfirst, reading_minutes, published_at, body_md, author_name",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_demo", false)
    .maybeSingle();

  return data ?? null;
}
