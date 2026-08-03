"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { passwordField } from "@/lib/auth/password";
import { SITE_URL } from "@/lib/brand";

const credentials = z.object({
  email: z.string().email().max(320),
  // Sign-in accepts whatever is on the account; only new passwords are held
  // to the policy, so tightening it never locks an existing member out.
  password: z.string().min(1).max(200),
});

const signUpSchema = credentials.extend({
  // A new password is held to the full policy.
  password: passwordField,
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

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Both new password fields must match.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password you have not used here before.",
  });

/**
 * Changing a password requires proving you know the current one, even though
 * the session already exists. Without that, anyone who finds an unlocked
 * laptop owns the account permanently.
 */
export async function changePassword(input: unknown) {
  const parsed = changeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Check the form.",
    };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Accounts are not connected here." };
  }
  if (!(await limiter("password-change"))) {
    return { ok: false as const, error: "Too many attempts. Wait a few minutes." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { ok: false as const, error: "Not signed in." };

  // Re-authenticate. signInWithPassword on the current session verifies the
  // old password without granting anything new.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) {
    return { ok: false as const, error: "That current password is not right." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
    data: { must_change_password: false },
  });
  if (error) return { ok: false as const, error: error.message };

  const db = createAdminClient();
  await db.from("audit_logs").insert({
    actor_id: user.id,
    action: "password.changed",
    subject_table: "auth.users",
    subject_user_id: user.id,
  });

  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Set after a reset link, where there is no old password to prove. */
export async function setNewPassword(input: unknown) {
  const parsed = z
    .object({
      newPassword: passwordField,
      confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
      path: ["confirmPassword"],
      message: "Both fields must match.",
    })
    .safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Check the form.",
    };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Accounts are not connected here." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "That link has expired." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
    data: { must_change_password: false },
  });
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true as const };
}
