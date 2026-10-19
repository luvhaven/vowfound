import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/** Request-scoped client acting as the signed-in user. RLS applies. */
export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          try {
            for (const { name, value, options } of list) store.set(name, value, options);
          } catch {
            // A Server Component cannot set cookies; the proxy refreshes them.
          }
        },
      },
    },
  );
}

export async function getUser() {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export type Member = { id: string; email: string; full_name: string | null; role: "member" | "staff" | "admin" };

export async function getMember(): Promise<Member | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("members").select("id, email, full_name, role").eq("id", user.id).maybeSingle();
  return (data as Member | null) ?? { id: user.id, email: user.email ?? "", full_name: null, role: "member" };
}
