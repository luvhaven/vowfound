import Link from "next/link";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import {
  Metric,
  Panel,
  StatusPill,
  EmptyState,
  formatDate,
} from "@/components/admin/primitives";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { countRows } from "@/lib/admin/data.server";
import { TOTAL_STEPS } from "@/lib/assessment/questions";

export default async function AdminOverviewPage() {
  if (!supabaseConfigured()) {
    return (
      <div>
        <WorkspaceHeader
          eyebrow="Practice at a glance"
          title="Operations overview"
          body="Supabase is not connected on this environment."
        />
        <div className="mt-10">
          <EmptyState
            title="Not connected"
            body="Set NEXT_PUBLIC_SUPABASE_URL and the key pair in .env.local, then run the migrations."
          />
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const [
    members,
    leads,
    started,
    completed,
    maps,
    openReports,
    pendingPayments,
    recentAssessments,
    recentAudit,
  ] = await Promise.all([
    countRows("profiles"),
    countRows("leads"),
    countRows("assessments"),
    countRows("assessments", { status: "completed" }),
    countRows("readiness_results"),
    countRows("safety_reports", { status: "open" }),
    countRows("payments", { status: "pending" }),
    supabase
      .from("assessments")
      .select("id, contact_name, contact_email, status, current_step, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("audit_logs")
      .select("id, action, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // The number that matters: how many people who start actually finish.
  const completion =
    started > 0 ? Math.round((completed / started) * 100) : null;

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Practice at a glance"
        title="Operations overview"
        body="Live counts read straight from the records, under your own role. Nothing here is projected, smoothed, or compared against a target."
        detail="Current environment"
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Members" value={members} href="/admin/users" hint="Accounts created" />
        <Metric label="Leads" value={leads} href="/admin/leads" hint="Finished, with an email" />
        <Metric
          label="Assessments"
          value={started}
          href="/admin/assessments"
          hint={`${completed} completed`}
        />
        <Metric
          label="Completion"
          value={completion === null ? "—" : `${completion}%`}
          hint={completion === null ? "No runs yet" : `of ${started} started`}
        />
      </div>

      {(openReports > 0 || pendingPayments > 0) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {openReports > 0 && (
            <Metric
              label="Open safety reports"
              value={openReports}
              href="/admin/safety"
              hint="Awaiting a first read"
            />
          )}
          {pendingPayments > 0 && (
            <Metric
              label="Pending payments"
              value={pendingPayments}
              href="/admin/payments"
              hint="Started, no webhook yet"
            />
          )}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <Panel
          title="Latest assessments"
          description="Where somebody stopped is usually more useful than the fact that somebody finished."
          action={
            <Link
              href="/admin/assessments"
              className="engraved text-onink-faint underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
            >
              All
            </Link>
          }
        >
          {(recentAssessments.data ?? []).length === 0 ? (
            <EmptyState
              title="Nothing yet"
              body="Runs appear the moment somebody answers the first question."
            />
          ) : (
            <ul className="divide-y divide-hairline">
              {(recentAssessments.data ?? []).map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/admin/assessments/${a.id}`}
                    className="text-[15px] text-onink underline decoration-onink-faint/40 underline-offset-4 hover:decoration-rose"
                  >
                    {a.contact_name ?? a.contact_email ?? "Anonymous"}
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="numeral text-[13px] text-onink-faint">
                      {a.current_step}/{TOTAL_STEPS}
                    </span>
                    <span className="text-[13px] text-onink-faint">
                      {formatDate(a.created_at)}
                    </span>
                    <StatusPill value={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent activity"
          description="Append-only. Administrators cannot edit or delete this."
          action={
            <Link
              href="/admin/audit"
              className="engraved text-onink-faint underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
            >
              Audit log
            </Link>
          }
        >
          {(recentAudit.data ?? []).length === 0 ? (
            <EmptyState title="Nothing logged" body="No privileged reads have happened yet." />
          ) : (
            <ul className="divide-y divide-hairline">
              {(recentAudit.data ?? []).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-[14px] text-onink-dim">{entry.action}</span>
                  <span className="text-[12px] text-onink-faint">
                    {formatDate(entry.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <p className="mt-10 max-w-2xl text-[14px] leading-relaxed text-onink-faint">
        Readiness maps produced: <span className="numeral text-onink-dim">{maps}</span>.
        There is deliberately no revenue projection, no funnel percentage beyond
        completion, and no vanity metric on this screen — a number nobody can
        trace back to rows is worse than no number.
      </p>
    </div>
  );
}
