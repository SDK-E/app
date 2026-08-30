export const USER_PAGE_SIZE = 25;

export interface Cursor {
  v: null | string;
  id: string;
}

export interface ListParams {
  query?: string;
  sort?: string;
  dir?: SortDir;
  cursor?: string;
  /** Seek backwards from the cursor instead of forwards (the "previous" link). */
  back?: boolean;
}

export interface PageResult<Row> {
  rows: Row[];
  nextCursor: null | string;
  prevCursor: null | string;
}

/** Describes how to compare rows against a cursor for one sort field. */
export interface SeekSpec {
  compare(op: "gt" | "lt", value: string): Record<string, unknown>;
  tiebreak(op: "gt" | "lt", id: string, value: string): Record<string, unknown>;
}

export type SortDir = "asc" | "desc";

/**
 * Keyset predicate: rows strictly after the cursor in sort order, with the
 * row id as a stable tiebreaker. Returns an empty object when there is no
 * usable cursor.
 */
export function buildSeekWhere(
  cursor: Cursor | null,
  dir: SortDir,
  spec: SeekSpec,
): Record<string, unknown> {
  if (!cursor || !cursor.v) return {};
  const op = dir === "asc" ? ("gt" as const) : ("lt" as const);
  return { AND: [{ OR: [spec.compare(op, cursor.v), spec.tiebreak(op, cursor.id, cursor.v)] }] };
}

export function dateSeek(field: string): SeekSpec {
  return {
    compare: (op, v) => ({ [field]: { [op]: new Date(v) } }),
    tiebreak: (op, id, v) => ({ [field]: new Date(v), id: { [op]: id } }),
  };
}

export function decodeCursor(cursor: string | undefined): Cursor | null {
  if (!cursor) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      typeof (parsed as Cursor).id === "string"
    ) {
      return { v: (parsed as Cursor).v ?? null, id: (parsed as Cursor).id };
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeCursor(value: Date | null | string, id: string): string {
  const payload: Cursor = { v: value instanceof Date ? value.toISOString() : value, id };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

/** Effective query direction when the request seeks backwards. */
export function queryDir(dir: SortDir, back?: boolean): SortDir {
  return back ? (dir === "asc" ? "desc" : "asc") : dir;
}

export function relationTextSeek(relation: string, field: string): SeekSpec {
  return {
    compare: (op, v) => ({ [relation]: { [field]: { [op]: v, mode: "insensitive" } } }),
    tiebreak: (op, id, v) => ({
      [relation]: { [field]: insensitiveEquals(v) },
      id: { [op]: id },
    }),
  };
}

export function textSeek(field: string): SeekSpec {
  return {
    compare: (op, v) => ({ [field]: { [op]: v, mode: "insensitive" } }),
    tiebreak: (op, id, v) => ({ [field]: insensitiveEquals(v), id: { [op]: id } }),
  };
}

/** Fetches pageSize+1 rows and turns them into a page with cursors. */
export function toPageResult<Row>(
  fetched: Row[],
  keyOf: (row: Row) => { v: Date | null | string; id: string },
  pageSize: number = USER_PAGE_SIZE,
  options?: { back?: boolean },
): PageResult<Row> {
  const hasMore = fetched.length > pageSize;
  let rows = hasMore ? fetched.slice(0, pageSize) : [...fetched];
  if (options?.back) rows = [...rows].reverse();
  const first = rows[0];
  const last = rows[rows.length - 1];
  return {
    rows,
    nextCursor: hasMore && last ? encodeCursor(keyOf(last).v, keyOf(last).id) : null,
    prevCursor: first && last ? encodeCursor(keyOf(first).v, keyOf(first).id) : null,
  };
}

function insensitiveEquals(value: string) {
  return { equals: value, mode: "insensitive" as const };
}
