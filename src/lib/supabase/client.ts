import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client. Uses the publishable key only. If a secret or service-role
 * key ever appears in this file the build is wrong — nothing in src/lib/supabase
 * except admin.ts may read a secret, and admin.ts is server-only.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
