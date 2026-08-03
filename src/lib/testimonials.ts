import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";

export interface Testimonial {
  id: string;
  firstName: string;
  context: string | null;
  quote: string;
}

/**
 * Published stories only. There is no seed data and no fallback: when there is
 * nothing real to show, this returns nothing and the page says so. The
 * database enforces the same rule — a row cannot reach 'published' without a
 * signed release recorded against it.
 */
export async function listTestimonials(): Promise<Testimonial[]> {
  if (!supabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, author_first_name, context, body")
    .eq("status", "published")
    .eq("is_demo", false)
    .order("published_at", { ascending: false })
    .limit(6);

  return (data ?? []).map((row) => ({
    id: row.id,
    firstName: row.author_first_name,
    context: row.context,
    quote: row.body,
  }));
}
