import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import {
  range,
  searchFilter,
  type ListParams,
} from "./query";

export interface Page<T> {
  rows: T[];
  total: number;
}

const EMPTY = { rows: [], total: 0 };

/**
 * One list query for every admin screen. Reads through the caller's own
 * session, so RLS decides what comes back — a bug in a screen cannot widen
 * access beyond the viewer's role.
 */
export async function listRows<T>(options: {
  table: string;
  select: string;
  params: ListParams;
  searchColumns?: string[];
  /** column -> value, applied with eq() */
  equals?: Record<string, string | boolean | null>;
  /** column -> values, applied with in() */
  oneOf?: Record<string, string[]>;
  /** Columns that may be sorted. Anything else falls back to the first. */
  sortable: string[];
}): Promise<Page<T>> {
  if (!supabaseConfigured()) return EMPTY as Page<T>;

  const supabase = await createClient();
  let query = supabase
    .from(options.table)
    .select(options.select, { count: "exact" });

  for (const [column, value] of Object.entries(options.equals ?? {})) {
    if (value === null) query = query.is(column, null);
    else query = query.eq(column, value);
  }

  for (const [column, values] of Object.entries(options.oneOf ?? {})) {
    if (values.length > 0) query = query.in(column, values);
  }

  const search = searchFilter(options.params.q, options.searchColumns ?? []);
  if (search) query = query.or(search);

  // Never interpolate a user-supplied column name into the order clause.
  const sort = options.sortable.includes(options.params.sort)
    ? options.params.sort
    : options.sortable[0];

  const [from, to] = range(options.params);
  const { data, count, error } = await query
    .order(sort, { ascending: options.params.dir === "asc" })
    .range(from, to);

  if (error) {
    console.error(`[admin] ${options.table} list failed`, error.message);
    return EMPTY as Page<T>;
  }

  return { rows: (data ?? []) as T[], total: count ?? 0 };
}

/** Counts for the overview and for filter tab badges. */
export async function countRows(
  table: string,
  equals: Record<string, string | boolean | null> = {},
): Promise<number> {
  if (!supabaseConfigured()) return 0;
  const supabase = await createClient();

  let query = supabase.from(table).select("*", { count: "exact", head: true });
  for (const [column, value] of Object.entries(equals)) {
    if (value === null) query = query.is(column, null);
    else query = query.eq(column, value);
  }

  const { count } = await query;
  return count ?? 0;
}

export async function getRow<T>(
  table: string,
  select: string,
  id: string,
  idColumn = "id",
): Promise<T | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from(table)
    .select(select)
    .eq(idColumn, id)
    .maybeSingle();
  return (data as T) ?? null;
}
