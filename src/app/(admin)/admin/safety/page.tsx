import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { FilterTabs, Pagination } from "@/components/admin/list-controls";
import {
  Panel,
  StatusPill,
  EmptyState,
  Metric,
  formatDateTime,
} from "@/components/admin/primitives";
import { ReportReviewer } from "@/components/admin/report-reviewer";
import { parseListParams } from "@/lib/admin/query";
import { listRows, countRows } from "@/lib/admin/data.server";
import { getViewer } from "@/lib/admin.server";

const BASE = "/admin/safety";

interface Row {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  category: string;
  detail: string;
  status: string;
  outcome_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default async function AdminSafetyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams, { sort: "created_at" });
  const viewer = await getViewer();

  const equals: Record<string, string | boolean | null> = {};
  if (params.filter) equals.status = params.filter;

  const [{ rows, total }, open, investigating] = await Promise.all([
    listRows<Row>({
      table: "safety_reports",
      select:
        "id, reporter_id, reported_user_id, category, detail, status, outcome_note, reviewed_at, created_at",
      params,
      equals,
      sortable: ["created_at", "status"],
    }),
    countRows("safety_reports", { status: "open" }),
    countRows("safety_reports", { status: "investigating" }),
  ]);

  const canReview =
    Boolean(viewer?.isAdmin) || Boolean(viewer?.roles.includes("safety_reviewer"));

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Review queue"
        title="Safety"
        body="Reviewers do not report to anyone whose work involves revenue, and can end a membership without consulting sales. Every decision here is written to the audit log."
        detail={`${total} reports`}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric label="Open" value={open} hint="Awaiting a first read" />
        <Metric label="Investigating" value={investigating} hint="In progress" />
        <Metric label="All reports" value={total} hint="All time" />
      </div>

      <div className="mt-10">
        <FilterTabs
          base={BASE}
          params={params}
          options={[
            { value: "", label: "All" },
            { value: "open", label: "Open" },
            { value: "investigating", label: "Investigating" },
            { value: "actioned", label: "Actioned" },
            { value: "dismissed", label: "Dismissed" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4">
        {rows.length === 0 ? (
          <EmptyState
            title="Queue is clear"
            body="Nothing has been reported. Reports arrive here directly from a member's account, never through the contact form."
          />
        ) : (
          rows.map((row) => (
            <Panel key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="engraved text-rose">{row.category}</p>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-onink-dim">
                    {row.detail}
                  </p>
                </div>
                <StatusPill value={row.status} />
              </div>

              <p className="mt-5 text-[13px] text-onink-faint">
                Reported {formatDateTime(row.created_at)}
                {row.reviewed_at && ` · reviewed ${formatDateTime(row.reviewed_at)}`}
              </p>

              {row.outcome_note && (
                <p className="mt-4 border-l-2 border-hairline pl-4 text-[14px] leading-relaxed text-onink-dim">
                  {row.outcome_note}
                </p>
              )}

              {canReview && row.status !== "dismissed" && row.status !== "actioned" && (
                <div className="mt-6 border-t border-hairline pt-5">
                  <ReportReviewer id={row.id} />
                </div>
              )}
            </Panel>
          ))
        )}

        <Pagination base={BASE} params={params} total={total} />
      </div>
    </div>
  );
}
