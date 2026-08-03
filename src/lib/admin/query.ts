/** Shared shape for every admin list screen: search, sort, page — all in the
 *  URL, so a view is linkable, refreshable, and survives a back button. */

export interface ListParams {
  q: string;
  sort: string;
  dir: "asc" | "desc";
  page: number;
  perPage: number;
  filter: string;
}

export const PER_PAGE = 25;

export function parseListParams(
  raw: Record<string, string | string[] | undefined>,
  defaults: { sort: string; dir?: "asc" | "desc" } = { sort: "created_at" },
): ListParams {
  const one = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Number.parseInt(one("page") ?? "1", 10);
  const perPage = Number.parseInt(one("perPage") ?? String(PER_PAGE), 10);
  const dir = one("dir") === "asc" ? "asc" : defaults.dir ?? "desc";

  return {
    q: (one("q") ?? "").trim().slice(0, 120),
    sort: one("sort") ?? defaults.sort,
    dir,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage:
      Number.isFinite(perPage) && perPage > 0 && perPage <= 100
        ? perPage
        : PER_PAGE,
    filter: (one("filter") ?? "").slice(0, 60),
  };
}

export function range(params: ListParams): [number, number] {
  const from = (params.page - 1) * params.perPage;
  return [from, from + params.perPage - 1];
}

/** Builds a PostgREST `or` filter across the given columns. Input is escaped
 *  so a comma or parenthesis in a search box cannot alter the filter tree. */
export function searchFilter(q: string, columns: string[]): string | null {
  if (!q) return null;
  const safe = q.replace(/[,()\\*"]/g, " ").trim();
  if (!safe) return null;
  return columns.map((c) => `${c}.ilike.*${safe}*`).join(",");
}

export function buildHref(
  base: string,
  params: ListParams,
  overrides: Partial<ListParams>,
): string {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  if (merged.q) search.set("q", merged.q);
  if (merged.filter) search.set("filter", merged.filter);
  if (merged.sort) search.set("sort", merged.sort);
  if (merged.dir !== "desc") search.set("dir", merged.dir);
  if (merged.page > 1) search.set("page", String(merged.page));
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}
