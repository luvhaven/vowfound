import "server-only";
import { createClient } from "@supabase/supabase-js";
import { fetchSupabase } from "@/lib/supabase/fetch";

/**
 * Service-role client. Bypasses RLS.
 *
 * Only three things may use it:
 *   1. anonymous assessment runs, which have no session to authorise
 *   2. verified payment webhooks
 *   3. account deletion, which must reach rows the user can no longer select
 *
 * It is server-only and the key is never sent to the browser. Do not import
 * this from a client component — the "server-only" package will fail the build
 * if you try.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. This client must never be constructed in the browser.",
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchSupabase },
  });
}

/** True when Supabase is configured. Lets the site render before setup. */
export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
