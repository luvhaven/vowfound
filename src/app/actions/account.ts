"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";

/** Tables a member may export, all keyed by user_id. */
const EXPORTABLE = [
  "profiles",
  "consent_records",
  "assessments",
  "readiness_results",
  "partner_preferences",
  "hard_constraints",
  "flexible_preferences",
  "programme_enrolments",
  "appointments",
  "payments",
  "notifications",
] as const;

export async function exportMyData() {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "not_signed_in" };
  if (!supabaseConfigured()) return { ok: false as const, error: "unavailable" };

  const supabase = await createClient();
  const bundle: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    account_id: user.id,
  };

  for (const table of EXPORTABLE) {
    const column = table === "profiles" ? "id" : "user_id";
    // Read under the member's own RLS, so an export can never return more
    // than that member is entitled to see.
    const { data } = await supabase.from(table).select("*").eq(column, user.id);
    bundle[table] = data ?? [];
  }

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id")
    .eq("user_id", user.id);

  if (assessments?.length) {
    const { data: answers } = await supabase
      .from("assessment_answers")
      .select("*")
      .in(
        "assessment_id",
        assessments.map((a) => a.id),
      );
    bundle.assessment_answers = answers ?? [];
  }

  return { ok: true as const, bundle };
}

const deleteSchema = z.object({
  confirmation: z.literal("DELETE"),
  reason: z.string().max(2000).optional(),
});

/**
 * Self-serve and immediate. Deleting the auth user cascades through every
 * table that references profiles, which is all of them. The service-role
 * client is required because the member loses the right to select these rows
 * partway through their own deletion.
 */
export async function deleteMyAccount(input: unknown) {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Type DELETE to confirm." };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "not_signed_in" };
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Deletion is not available on this environment." };
  }

  const db = createAdminClient();

  await db.from("data_deletion_requests").insert({
    user_id: user.id,
    reason: parsed.data.reason ?? null,
    status: "processing",
  });

  await db.from("audit_logs").insert({
    actor_id: user.id,
    action: "account.deleted",
    subject_table: "profiles",
    subject_id: user.id,
    subject_user_id: user.id,
    detail: { self_serve: true },
  });

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    return { ok: false as const, error: "We could not complete that. Contact privacy@vowfound.com." };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");

  return { ok: true as const };
}

const consentSchema = z.object({
  kind: z.enum([
    "photography_use",
    "introductions",
    "background_check",
    "marketing",
  ]),
  granted: z.boolean(),
});

/** Each consent is revocable on its own, without affecting the others. */
export async function setConsent(input: unknown) {
  const parsed = consentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };

  const user = await getSessionUser();
  if (!user) return { ok: false as const };
  if (!supabaseConfigured()) return { ok: false as const };

  const supabase = await createClient();
  await supabase.from("consent_records").insert({
    user_id: user.id,
    kind: parsed.data.kind,
    granted: parsed.data.granted,
    revoked_at: parsed.data.granted ? null : new Date().toISOString(),
  });

  revalidatePath("/account/privacy");
  return { ok: true as const };
}
