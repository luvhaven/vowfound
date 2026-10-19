"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, getUser, supabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/brand";

export type AuthState = { sent?: boolean; error?: string } | undefined;

const schema = z.object({
  email: z.string().trim().email().max(320),
  full_name: z.string().trim().max(120).optional(),
  next: z.string().max(200).optional(),
});

/** Passwordless: one email, one link. Nothing to forget or leak. */
export async function sendMagicLink(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!supabaseConfigured()) return { error: "Sign-in isn't configured yet." };

  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(`auth:${ip}`, 6, 900)) return { error: "Too many attempts. Try again in 15 minutes." };

  const next = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : "/account";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
      data: parsed.data.full_name ? { full_name: parsed.data.full_name } : undefined,
    },
  });
  if (error) {
    console.error("[auth] otp failed", error.message);
    return { error: "We couldn't send the link. Check the address and try again." };
  }
  return { sent: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateName(form: FormData) {
  const name = String(form.get("full_name") ?? "").trim().slice(0, 120);
  const user = await getUser();
  if (!user) redirect("/sign-in");
  const supabase = await createClient();
  await supabase.from("members").update({ full_name: name || null }).eq("id", user.id);
  redirect("/account?saved=1");
}

/** Permanently deletes the account. Orders are kept for accounting with the
 *  member link removed (on delete set null); checks are unlinked likewise. */
export async function deleteAccount(form: FormData) {
  if (form.get("confirm") !== "DELETE") redirect("/account?delete=confirm");
  const user = await getUser();
  if (!user) redirect("/sign-in");
  const admin = createAdminClient();
  await admin.from("readiness_checks").delete().eq("member_id", user.id);
  await admin.auth.admin.deleteUser(user.id);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
