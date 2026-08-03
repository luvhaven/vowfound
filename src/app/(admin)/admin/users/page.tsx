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

const BASE = "/admin/users";

interface Row {
  id: string;
  email: string;
  full_name: string | null;
  country_code: string | null;
  city: string | null;
  created_at: string;
  deleted_at: string | null;
  onboarding_completed_at: string | null;
  is_demo: boolean;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams, { sort: "created_at" });

  const equals: Record<string, string | boolean | null> = {};
  if (params.filter === "active") equals.deleted_at = null;
  if (params.filter === "demo") equals.is_demo = true;

  const { rows, total } = await listRows<Row>({
    table: "profiles",
    select:
      "id, email, full_name, country_code, city, created_at, deleted_at, onboarding_completed_at, is_demo",
    params,
    searchColumns: ["email", "full_name", "city"],
    equals,
    sortable: ["created_at", "email", "full_name"],
  });

  // Reading the member register is a read of other people's private data.
  const viewer = await getViewer();
  if (viewer && rows.length > 0) {
    await recordAudit({
      actorId: viewer.id,
      action: "admin.users.list",
      subjectTable: "profiles",
      detail: { returned: rows.length, query: params.q || null },
    });
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Member register"
        title="Users"
        body="Opening this register is written to the audit log, with the number of records returned and any search term used."
        detail={`${total} total`}
      />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <SearchBox base={BASE} params={params} placeholder="Name, email or city" />
        <FilterTabs
          base={BASE}
          params={params}
          options={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "demo", label: "Demonstration" },
          ]}
        />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No members"
            body={
              params.q
                ? `Nothing matches “${params.q}”. Clear the search to see every member.`
                : "Nobody has signed up yet. Members appear here the moment they create an account."
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-[12px] border border-hairline bg-onink/[0.018] px-5">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="full_name">
                      Member
                    </SortLink>
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="email">
                      Email
                    </SortLink>
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Location
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="created_at">
                      Joined
                    </SortLink>
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-hairline transition-colors last:border-b-0 hover:bg-onink/[0.035]"
                  >
                    <td className="py-4 pr-6 align-middle">
                      <Link
                        href={`${BASE}/${row.id}`}
                        className="text-[15px] text-onink underline decoration-onink-faint/40 underline-offset-4 hover:decoration-rose"
                      >
                        {row.full_name ?? "Unnamed"}
                      </Link>
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {row.email}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {[row.city, row.country_code].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="numeral py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="py-4 pr-6 align-middle">
                      <StatusPill
                        value={
                          row.deleted_at
                            ? "deleted"
                            : row.onboarding_completed_at
                              ? "active"
                              : "pending"
                        }
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
