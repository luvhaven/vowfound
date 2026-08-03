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
  Metric,
  formatDateTime,
} from "@/components/admin/primitives";
import { parseListParams } from "@/lib/admin/query";
import { listRows, countRows } from "@/lib/admin/data.server";
import { formatPrice, type Currency } from "@/lib/products";

const BASE = "/admin/payments";

interface Row {
  id: string;
  user_id: string | null;
  provider: string;
  provider_reference: string;
  status: string;
  currency: Currency;
  amount_minor: number;
  email: string | null;
  paid_at: string | null;
  created_at: string;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams, { sort: "created_at" });

  const equals: Record<string, string | boolean | null> = {};
  if (params.filter) equals.status = params.filter;

  const [{ rows, total }, succeeded, pending, failed] = await Promise.all([
    listRows<Row>({
      table: "payments",
      select:
        "id, user_id, provider, provider_reference, status, currency, amount_minor, email, paid_at, created_at",
      params,
      searchColumns: ["email", "provider_reference"],
      equals,
      sortable: ["created_at", "amount_minor", "status"],
    }),
    countRows("payments", { status: "succeeded" }),
    countRows("payments", { status: "pending" }),
    countRows("payments", { status: "failed" }),
  ]);

  // Settled money only, split by currency — the two are never added together.
  const settled = rows.filter((r) => r.status === "succeeded");
  const ngn = settled
    .filter((r) => r.currency === "NGN")
    .reduce((sum, r) => sum + r.amount_minor, 0);
  const usd = settled
    .filter((r) => r.currency === "USD")
    .reduce((sum, r) => sum + r.amount_minor, 0);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Settled and pending"
        title="Payments"
        body="Written only by verified provider webhooks. Nothing on this screen can create, alter or refund a charge — that happens in Stripe and Paystack, and arrives back here."
        detail={`${total} records`}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Succeeded" value={succeeded} hint="All time" />
        <Metric label="Pending" value={pending} hint="Awaiting webhook" />
        <Metric label="Failed" value={failed} hint="All time" />
        <Metric
          label="On this page"
          value={
            ngn > 0 && usd > 0
              ? `${formatPrice(ngn / 100, "NGN")} + ${formatPrice(usd / 100, "USD")}`
              : ngn > 0
                ? formatPrice(ngn / 100, "NGN")
                : formatPrice(usd / 100, "USD")
          }
          hint="Settled, never converted between currencies"
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <SearchBox base={BASE} params={params} placeholder="Email or reference" />
        <FilterTabs
          base={BASE}
          params={params}
          options={[
            { value: "", label: "All" },
            { value: "succeeded", label: "Succeeded" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No payments"
            body="Charges appear the moment a provider webhook is verified. Add sandbox keys to .env.local to exercise the flow."
          />
        ) : (
          <div className="overflow-x-auto rounded-[12px] border border-hairline bg-onink/[0.018] px-5">
            <table className="w-full min-w-[54rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline">
                  <th scope="col" className="py-4 pr-6 text-right">
                    <SortLink base={BASE} params={params} column="amount_minor" numeric>
                      Amount
                    </SortLink>
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Payer
                  </th>
                  <th scope="col" className="engraved py-4 pr-6 font-normal text-onink-faint">
                    Provider
                  </th>
                  <th scope="col" className="py-4 pr-6">
                    <SortLink base={BASE} params={params} column="created_at">
                      When
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
                    <td className="numeral py-4 pr-6 text-right align-middle text-[15px] text-onink">
                      {formatPrice(row.amount_minor / 100, row.currency)}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {row.user_id ? (
                        <Link
                          href={`/admin/users/${row.user_id}`}
                          className="underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
                        >
                          {row.email ?? "Member"}
                        </Link>
                      ) : (
                        (row.email ?? "—")
                      )}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[14px] text-onink-dim">
                      {row.provider}
                    </td>
                    <td className="py-4 pr-6 align-middle text-[13px] text-onink-dim">
                      {formatDateTime(row.paid_at ?? row.created_at)}
                    </td>
                    <td className="py-4 pr-6 align-middle">
                      <StatusPill value={row.status} />
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
