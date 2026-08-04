import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchSupabase } from "@/lib/supabase/fetch";

/** Request-scoped client that acts as the signed-in user. RLS applies. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { fetch: fetchSupabase },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component; the middleware refreshes sessions.
          }
        },
      },
    },
  );
}

export async function getSessionUser() {
  // Without Supabase there is no session, so every caller must treat the
  // request as signed out rather than throwing on a missing URL.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
