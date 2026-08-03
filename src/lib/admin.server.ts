import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";

export type StaffRole =
  | "coach"
  | "matchmaker"
  | "safety_reviewer"
  | "support_agent"
  | "content_editor"
  | "administrator"
  | "super_administrator";

export interface Viewer {
  id: string;
  email: string | null;
  roles: StaffRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Roles come from the database, never from a cookie or a client claim. RLS
 * enforces the same rules independently, so a missed check here still cannot
 * return another user's rows.
 */
export async function getViewer(): Promise<Viewer | null> {
  if (!supabaseConfigured()) return null;

  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = (data ?? []).map((r) => r.role as StaffRole);

  return {
    id: user.id,
    email: user.email ?? null,
    roles,
    isAdmin: roles.some(
      (r) => r === "administrator" || r === "super_administrator",
    ),
    isSuperAdmin: roles.includes("super_administrator"),
  };
}

/**
 * Every read of another user's private data is written to audit_logs. Call
 * this from any admin screen that displays member records.
 */
export async function recordAudit(input: {
  actorId: string;
  action: string;
  subjectTable?: string;
  subjectId?: string;
  subjectUserId?: string;
  detail?: Record<string, unknown>;
}) {
  if (!supabaseConfigured()) return;

  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "";
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : null;

  const db = createAdminClient();
  await db.from("audit_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    subject_table: input.subjectTable ?? null,
    subject_id: input.subjectId ?? null,
    subject_user_id: input.subjectUserId ?? null,
    ip_hash: ipHash,
    user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
    detail: input.detail ?? {},
  });
}
