"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { getViewer, recordAudit } from "@/lib/admin.server";

const ASSIGNABLE = [
  "applicant",
  "member",
  "coach",
  "matchmaker",
  "safety_reviewer",
  "support_agent",
  "content_editor",
  "administrator",
  "super_administrator",
] as const;

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ASSIGNABLE),
  grant: z.boolean(),
});

/**
 * Role changes are the highest-privilege action in the product, so they are
 * guarded three times over: only a super administrator may call this, the
 * database enforces the same rule through the user_roles policy, and every
 * change is written to the audit log before it takes effect.
 */
export async function setUserRole(input: unknown) {
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Database is not connected." };
  }

  const viewer = await getViewer();
  if (!viewer?.isSuperAdmin) {
    return {
      ok: false as const,
      error: "Only a super administrator can change roles.",
    };
  }

  const { userId, role, grant } = parsed.data;

  // Removing your own last super_administrator role locks everyone out.
  if (!grant && role === "super_administrator" && userId === viewer.id) {
    return {
      ok: false as const,
      error: "You cannot remove your own super administrator role.",
    };
  }

  const db = createAdminClient();

  await recordAudit({
    actorId: viewer.id,
    action: grant ? "role.granted" : "role.revoked",
    subjectTable: "user_roles",
    subjectUserId: userId,
    detail: { role },
  });

  if (grant) {
    const { error } = await db
      .from("user_roles")
      .upsert({ user_id: userId, role, granted_by: viewer.id }, {
        onConflict: "user_id,role",
      });
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await db
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true as const };
}

const noteSchema = z.object({
  subjectUserId: z.string().uuid(),
  body: z.string().min(1).max(8000),
});

/** A private note is readable only by its author and by administrators. */
export async function addPrivateNote(input: unknown) {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Write something first." };

  const viewer = await getViewer();
  if (!viewer) return { ok: false as const, error: "Not signed in." };
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Database is not connected." };
  }

  const db = createAdminClient();
  const { error } = await db.from("private_notes").insert({
    author_id: viewer.id,
    subject_user_id: parsed.data.subjectUserId,
    body: parsed.data.body,
  });

  if (error) return { ok: false as const, error: error.message };

  await recordAudit({
    actorId: viewer.id,
    action: "note.created",
    subjectTable: "private_notes",
    subjectUserId: parsed.data.subjectUserId,
  });

  revalidatePath(`/admin/users/${parsed.data.subjectUserId}`);
  return { ok: true as const };
}

const reportSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "investigating", "actioned", "dismissed"]),
  outcome: z.string().max(4000).optional(),
});

export async function resolveSafetyReport(input: unknown) {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  const viewer = await getViewer();
  const allowed =
    viewer?.isAdmin || viewer?.roles.includes("safety_reviewer");
  if (!viewer || !allowed) {
    return { ok: false as const, error: "You cannot review reports." };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Database is not connected." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("safety_reports")
    .update({
      status: parsed.data.status,
      outcome_note: parsed.data.outcome ?? null,
      reviewed_by: viewer.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) return { ok: false as const, error: error.message };

  await recordAudit({
    actorId: viewer.id,
    action: `safety.${parsed.data.status}`,
    subjectTable: "safety_reports",
    subjectId: parsed.data.id,
  });

  revalidatePath("/admin/safety");
  return { ok: true as const };
}
