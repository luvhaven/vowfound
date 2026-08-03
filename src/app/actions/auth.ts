"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/brand";

const credentials = z.object({
  email: z.string().email().max(320),
  password: z.string().min(10, "Use at least ten characters.").max(200),
});

const signUpSchema = credentials.extend({
  fullName: z.string().min(1).max(120),
  // Adult-only. Confirmed at signup and recorded as a consent event.
  ageConfirmed: z.literal(true),
  acceptTerms: z.literal(true),
});

async function limiter(scope: string) {
  const h = await headers();
  return rateLimit(`${scope}:${h.get("x-forwarded-for") ?? "local"}`, 8, 900);
}

export async function signUp(input: unknown) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error:
        parsed.error.issues[0]?.message ??
        "Check the form and try again.",
    };
  }
  if (!(await limiter("signup"))) {
    return { ok: false as const, error: "Too many attempts. Wait a few minutes." };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Accounts are not connected on this environment yet." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback`,
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) return { ok: false as const, error: error.message };

  if (data.user) {
    const db = createAdminClient();
    const now = new Date().toISOString();
    await db.from("profiles").update({ age_confirmed_at: now }).eq("id", data.user.id);
    await db.from("consent_records").insert([
      { user_id: data.user.id, kind: "age_confirmation", granted: true },
      { user_id: data.user.id, kind: "terms", granted: true },
      { user_id: data.user.id, kind: "privacy", granted: true },
    ]);
  }

  return { ok: true as const, needsConfirmation: !data.session };
}

export async function signIn(input: unknown) {
  const parsed = credentials.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Check your email and password." };
  }
  if (!(await limiter("signin"))) {
    return { ok: false as const, error: "Too many attempts. Wait a few minutes." };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Accounts are not connected on this environment yet." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  // Deliberately identical for a wrong password and an unknown address, so
  // this form cannot be used to discover who has an account.
  if (error) {
    return { ok: false as const, error: "That email and password do not match." };
  }

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function requestPasswordReset(input: unknown) {
  const parsed = z.object({ email: z.string().email() }).safeParse(input);
  if (!parsed.success) return { ok: true as const };
  if (!(await limiter("reset"))) return { ok: true as const };
  if (!supabaseConfigured()) return { ok: true as const };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/account/security`,
  });

  // Always the same answer, whether or not the address exists.
  return { ok: true as const };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
