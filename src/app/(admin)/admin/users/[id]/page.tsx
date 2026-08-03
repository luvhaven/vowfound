import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import {
  Panel,
  DefinitionList,
  StatusPill,
  EmptyState,
  formatDate,
  formatDateTime,
} from "@/components/admin/primitives";
import { RoleEditor } from "@/components/admin/role-editor";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { getViewer, recordAudit } from "@/lib/admin.server";
import { formatPrice, type Currency } from "@/lib/products";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  preferred_name: string | null;
  phone: string | null;
  country_code: string | null;
  city: string | null;
  date_of_birth: string | null;
  marriage_timeline: string | null;
  age_confirmed_at: string | null;
  email_verified_at: string | null;
  onboarding_completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  is_demo: boolean;
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!supabaseConfigured()) notFound();

  const supabase = await createClient();
  const viewer = await getViewer();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, preferred_name, phone, country_code, city, date_of_birth, marriage_timeline, age_confirmed_at, email_verified_at, onboarding_completed_at, deleted_at, created_at, is_demo",
    )
    .eq("id", id)
    .maybeSingle<Profile>();

  if (!profile) notFound();

  // Opening one member's record is the read that most needs a trail.
  if (viewer) {
    await recordAudit({
      actorId: viewer.id,
      action: "admin.user.view",
      subjectTable: "profiles",
      subjectId: id,
      subjectUserId: id,
    });
  }

  const [roles, consents, payments, assessments, notes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", id),
    supabase
      .from("consent_records")
      .select("kind, granted, granted_at, revoked_at")
      .eq("user_id", id)
      .order("granted_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, status, currency, amount_minor, paid_at, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assessments")
      .select("id, status, current_step, completed_at, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("private_notes")
      .select("id, body, created_at")
      .eq("subject_user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const held = (roles.data ?? []).map((r) => r.role as string);

  // Latest state per consent kind — a withdrawal is a new row, not an edit.
  const latestConsent = new Map<string, { granted: boolean; at: string }>();
  for (const row of consents.data ?? []) {
    if (!latestConsent.has(row.kind)) {
      latestConsent.set(row.kind, { granted: row.granted, at: row.granted_at });
    }
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Member record"
        title={profile.full_name ?? profile.email}
        body="Every field here is private to this member, their assigned staff, and administrators. This view is recorded in the audit log."
        detail={profile.deleted_at ? "Deleted" : "Active"}
      />

      <p className="mt-6">
        <Link
          href="/admin/users"
          className="engraved text-onink-faint underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
        >
          Back to the register
        </Link>
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="grid gap-6">
          <Panel title="Identity">
            <DefinitionList
              items={[
                { label: "Email", value: profile.email },
                { label: "Full name", value: profile.full_name ?? "—" },
                { label: "Preferred name", value: profile.preferred_name ?? "—" },
                { label: "Phone", value: profile.phone ?? "—" },
                {
                  label: "Location",
                  value:
                    [profile.city, profile.country_code]
                      .filter(Boolean)
                      .join(", ") || "—",
                },
                { label: "Date of birth", value: formatDate(profile.date_of_birth) },
                {
                  label: "Marriage timeline",
                  value: profile.marriage_timeline ?? "Not stated",
                },
                { label: "Joined", value: formatDateTime(profile.created_at) },
                {
                  label: "Age confirmed",
                  value: formatDateTime(profile.age_confirmed_at),
                },
              ]}
            />
          </Panel>

          <Panel
            title="Assessments"
            description="Partial runs are kept. Where somebody stopped is often the most useful signal on the record."
          >
            {(assessments.data ?? []).length === 0 ? (
              <EmptyState
                title="None yet"
                body="This member has not started the readiness assessment."
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {(assessments.data ?? []).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/admin/assessments/${a.id}`}
                      className="text-[15px] text-onink underline decoration-onink-faint/40 underline-offset-4 hover:decoration-rose"
                    >
                      Started {formatDate(a.created_at)}
                    </Link>
                    <div className="flex items-center gap-4">
                      <span className="numeral text-[13px] text-onink-faint">
                        step {a.current_step}
                      </span>
                      <StatusPill value={a.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Payments"
            description="Written only by verified provider webhooks. Nothing on this screen can create or alter one."
          >
            {(payments.data ?? []).length === 0 ? (
              <EmptyState title="No payments" body="Nothing has been charged to this member." />
            ) : (
              <ul className="divide-y divide-hairline">
                {(payments.data ?? []).map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <span className="numeral text-[15px] text-onink">
                      {formatPrice(p.amount_minor / 100, p.currency as Currency)}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-onink-faint">
                        {formatDate(p.paid_at ?? p.created_at)}
                      </span>
                      <StatusPill value={p.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-6">
          <Panel
            title="Roles"
            description="Enforced in the database. A role removed here is removed everywhere, immediately."
          >
            <RoleEditor
              userId={profile.id}
              held={held}
              canEdit={Boolean(viewer?.isSuperAdmin)}
            />
          </Panel>

          <Panel
            title="Consent"
            description="Four separate permissions, each independently revocable by the member."
          >
            {latestConsent.size === 0 ? (
              <EmptyState title="No records" body="No consent has been captured yet." />
            ) : (
              <ul className="divide-y divide-hairline">
                {[...latestConsent.entries()].map(([kind, state]) => (
                  <li
                    key={kind}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="engraved text-onink-dim">
                      {kind.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-onink-faint">
                        {formatDate(state.at)}
                      </span>
                      <StatusPill value={state.granted ? "active" : "declined"} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Private notes"
            description="Readable by the author and administrators. Never by the member, and never by other staff."
          >
            {(notes.data ?? []).length === 0 ? (
              <EmptyState title="No notes" body="Nothing has been recorded about this member." />
            ) : (
              <ul className="space-y-4">
                {(notes.data ?? []).map((n) => (
                  <li key={n.id} className="rounded-[12px] border border-hairline p-4">
                    <p className="text-[14px] leading-relaxed text-onink-dim">{n.body}</p>
                    <p className="mt-3 text-[12px] text-onink-faint">
                      {formatDateTime(n.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
