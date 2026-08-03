import Link from "next/link";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import {
  SearchBox,
  FilterTabs,
  SortLink,
  Pagination,
} from "@/components/admin/list-controls";
import {
  StatusPill,
  EmptyState,
  formatDate,
} from "@/components/admin/primitives";
import { parseListParams } from "@/lib/admin/query";
import { listRows } from "@/lib/admin/data.server";
import { getViewer, recordAudit } from "@/lib/admin.server";
import { TOTAL_STEPS } from "@/lib/assessment/questions";

const BASE = "/admin/assessments";

interface Row {
  id: string;
  status: string;
  current_step: number;
  marriage_timeline: string | null;
  contact_email: string | null;
  contact_name: string | null;
  created_at: string;
  is_demo: boolean;
}

export default async function AdminAssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams, { sort: "created_at" });

  const equals: Record<string, string | boolean | null> = {};
  if (params.filter) equals.status = params.filter;

  const { rows, total } = await listRows<Row>({
    table: "assessments",
    select:
      "id, status, current_step, marriage_timeline, contact_email, contact_name, created_at, is_demo",
    params,
    searchColumns: ["contact_email", "contact_name"],
    equals,
    sortable: ["created_at", "current_step", "status"],
  });

  const viewer = await getViewer();
  if (viewer && rows.length > 0) {
    await recordAudit({
      actorId: viewer.id,
      action: "admin.assessments.list",
      subjectTable: "assessments",
      detail: { returned: rows.length },
    });
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Readiness intake"
        title="Assessments"
        body="Partial runs are kept deliberately. Where somebody stopped is usually more useful than the fact that somebody finished."
        detail={`${total} total`}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <SearchBox base={BASE} params={params} placeholder="Name or email" />
        <FilterTabs
          base={BASE}
          params={params}
          options={[
            { value: "", label: "All" },
            { value: "completed", label: "Completed" },
            { value: "in_progress", label: "In progress" },
            { value: "abandoned", label: "Abandoned" },
          ]}
        />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No assessments"
            body="Runs appear here as soon as somebody answers the first question, whether or not they have an account."
          />
        ) : (
          <div className="overflow-x-auto rounded-[12px] border border-hairline bg-onink/[0.018] px-5">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Person
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Timeline
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="current_step">
                      Progress
                    </SortLink>
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="created_at">
                      Started
                    </SortLink>
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const pct = Math.round((row.current_step / TOTAL_STEPS) * 100);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-hairline transition-colors last:border-b-0 hover:bg-onink/[0.035]"
                    >
                      <td className="py-4 pr-6 align-middle">
                        <Link
                          href={`${BASE}/${row.id}`}
                          className="text-[15px] text-onink underline decoration-onink-faint/40 underline-offset-4 hover:decoration-rose"
                        >
                          {row.contact_name ?? row.contact_email ?? "Anonymous"}
                        </Link>
                      </td>
                      <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                        {row.marriage_timeline ?? "—"}
                      </td>
                      <td className="py-4 pr-6 align-middle">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="h-px w-20 bg-hairline"
                          >
                            <span
                              className="block h-px bg-rose"
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </span>
                          <span className="numeral text-[13px] text-onink-faint">
                            {row.current_step}/{TOTAL_STEPS}
                          </span>
                        </div>
                      </td>
                      <td className="numeral py-4 pr-6 align-middle text-[14px] text-onink-dim">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="py-4 pr-6 align-middle">
                        <StatusPill value={row.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination base={BASE} params={params} total={total} />
      </div>
    </div>
  );
}
