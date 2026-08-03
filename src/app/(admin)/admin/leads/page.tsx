import Link from "next/link";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import {
  SearchBox,
  FilterTabs,
  SortLink,
  Pagination,
} from "@/components/admin/list-controls";
import { EmptyState, StatusPill, formatDate } from "@/components/admin/primitives";
import { parseListParams } from "@/lib/admin/query";
import { listRows } from "@/lib/admin/data.server";

const BASE = "/admin/leads";

interface Row {
  id: string;
  email: string | null;
  full_name: string | null;
  marriage_timeline: string | null;
  source: string | null;
  assessment_id: string | null;
  converted_user_id: string | null;
  created_at: string;
  is_demo: boolean;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams, { sort: "created_at" });

  const equals: Record<string, string | boolean | null> = {};
  if (params.filter === "converted") equals.converted_user_id = "not-null";
  if (params.filter === "open") equals.converted_user_id = null;

  const { rows, total } = await listRows<Row>({
    table: "leads",
    select:
      "id, email, full_name, marriage_timeline, source, assessment_id, converted_user_id, created_at, is_demo",
    params,
    searchColumns: ["email", "full_name"],
    // "not-null" is not a value the helper understands, so only the null case
    // is pushed down; converted rows are filtered below.
    equals: params.filter === "open" ? { converted_user_id: null } : {},
    sortable: ["created_at", "email"],
  });

  const visible =
    params.filter === "converted"
      ? rows.filter((r) => r.converted_user_id)
      : rows;

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Qualified interest"
        title="Leads"
        body="A lead exists only after somebody finishes the assessment and leaves an email address. Choosing a timeline on the home page never creates one."
        detail={`${total} total`}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <SearchBox base={BASE} params={params} placeholder="Name or email" />
        <FilterTabs
          base={BASE}
          params={params}
          options={[
            { value: "", label: "All" },
            { value: "open", label: "No account yet" },
            { value: "converted", label: "Converted" },
          ]}
        />
      </div>

      <div className="mt-6">
        {visible.length === 0 ? (
          <EmptyState
            title="No leads"
            body="Nobody has completed the assessment and left contact details yet."
          />
        ) : (
          <div className="overflow-x-auto rounded-[12px] border border-hairline bg-onink/[0.018] px-5">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Name
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="email">
                      Email
                    </SortLink>
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Timeline
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Source
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="created_at">
                      Created
                    </SortLink>
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    State
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-hairline transition-colors last:border-b-0 hover:bg-onink/[0.035]"
                  >
                    <td className="py-4 pr-6 align-middle text-[15px] text-onink">
                      {row.full_name ?? "—"}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {row.email ?? "—"}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {row.marriage_timeline ?? "—"}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {row.assessment_id ? (
                        <Link
                          href={`/admin/assessments/${row.assessment_id}`}
                          className="underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
                        >
                          {row.source ?? "assessment"}
                        </Link>
                      ) : (
                        (row.source ?? "—")
                      )}
                    </td>
                    <td className="numeral py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="py-4 pr-6 align-middle">
                      <StatusPill
                        value={row.converted_user_id ? "active" : "pending"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination base={BASE} params={params} total={total} />
      </div>
    </div>
  );
}
