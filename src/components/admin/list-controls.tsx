import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildHref, pageCount, type ListParams } from "@/lib/admin/query";

/** Search box. A plain GET form, so it works before hydration and the result
 *  is a real URL rather than transient component state. */
export function SearchBox({
  base,
  params,
  placeholder,
}: {
  base: string;
  params: ListParams;
  placeholder: string;
}) {
  return (
    <form action={base} method="get" className="flex w-full max-w-sm gap-2">
      {params.filter && (
        <input type="hidden" name="filter" value={params.filter} />
      )}
      {params.sort && <input type="hidden" name="sort" value={params.sort} />}
      <label htmlFor="admin-search" className="sr-only">
        {placeholder}
      </label>
      <input
        id="admin-search"
        name="q"
        type="search"
        defaultValue={params.q}
        placeholder={placeholder}
        className="h-10 w-full rounded-[12px] border border-hairline bg-onink/[0.03] px-4 text-[14px] text-onink placeholder:text-onink-faint focus:border-onink/30"
      />
      <button
        type="submit"
        className="engraved h-10 shrink-0 rounded-[12px] border border-onink/20 px-4 text-onink-dim transition-colors hover:border-onink/40 hover:text-onink"
      >
        Search
      </button>
    </form>
  );
}

/** Segmented filter. Each option is a link, so filters are shareable. */
export function FilterTabs({
  base,
  params,
  options,
}: {
  base: string;
  params: ListParams;
  options: { value: string; label: string; count?: number }[];
}) {
  return (
    <nav aria-label="Filter" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = params.filter === option.value;
        return (
          <Link
            key={option.value || "all"}
            href={buildHref(base, params, { filter: option.value, page: 1 })}
            aria-current={active ? "true" : undefined}
            className={cn(
              "engraved rounded-[12px] border px-3.5 py-2 transition-colors",
              active
                ? "border-rose/50 bg-rose/10 text-onink"
                : "border-hairline text-onink-faint hover:border-onink/25 hover:text-onink-dim",
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span className="numeral ml-2 opacity-60">{option.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function SortLink({
  base,
  params,
  column,
  children,
  numeric,
}: {
  base: string;
  params: ListParams;
  column: string;
  children: React.ReactNode;
  numeric?: boolean;
}) {
  const active = params.sort === column;
  const nextDir = active && params.dir === "desc" ? "asc" : "desc";

  return (
    <Link
      href={buildHref(base, params, { sort: column, dir: nextDir, page: 1 })}
      className={cn(
        "engraved inline-flex items-center gap-1.5 font-normal transition-colors",
        active ? "text-onink" : "text-onink-faint hover:text-onink-dim",
        numeric && "flex-row-reverse",
      )}
    >
      {children}
      <span aria-hidden className="text-[9px] opacity-70">
        {active ? (params.dir === "desc" ? "▼" : "▲") : "◆"}
      </span>
    </Link>
  );
}

export function Pagination({
  base,
  params,
  total,
}: {
  base: string;
  params: ListParams;
  total: number;
}) {
  const pages = pageCount(total, params.perPage);
  if (total === 0) return null;

  const first = (params.page - 1) * params.perPage + 1;
  const last = Math.min(params.page * params.perPage, total);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="numeral text-[13px] text-onink-faint">
        {first}&ndash;{last} of {total}
      </p>

      <div className="flex items-center gap-2">
        <PageLink
          base={base}
          params={params}
          to={params.page - 1}
          disabled={params.page <= 1}
        >
          Previous
        </PageLink>
        <p className="numeral engraved px-2 text-onink-dim">
          {params.page} / {pages}
        </p>
        <PageLink
          base={base}
          params={params}
          to={params.page + 1}
          disabled={params.page >= pages}
        >
          Next
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  base,
  params,
  to,
  disabled,
  children,
}: {
  base: string;
  params: ListParams;
  to: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="engraved rounded-[12px] border border-hairline px-3.5 py-2 text-onink-faint opacity-40">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={buildHref(base, params, { page: to })}
      className="engraved rounded-[12px] border border-hairline px-3.5 py-2 text-onink-dim transition-colors hover:border-onink/30 hover:text-onink"
    >
      {children}
    </Link>
  );
}
