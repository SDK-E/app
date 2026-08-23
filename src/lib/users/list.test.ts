import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  decodeCursor,
  encodeCursor,
  buildSeekWhere,
  toPageResult,
  type SeekSpec,
} from "@/lib/users/list";

describe("cursor encoding", () => {
  it("round-trips string values", () => {
    const cursor = decodeCursor(encodeCursor("Alice", "row-1"));
    expect(cursor).toEqual({ v: "Alice", id: "row-1" });
  });

  it("round-trips dates as ISO strings", () => {
    const date = new Date("2026-08-01T00:00:00.000Z");
    const cursor = decodeCursor(encodeCursor(date, "row-2"));
    expect(cursor).toEqual({ v: "2026-08-01T00:00:00.000Z", id: "row-2" });
  });

  it("returns null for absent or malformed cursors", () => {
    expect(decodeCursor(undefined)).toBeNull();
    expect(decodeCursor("!!!not-base64url-json!!!")).toBeNull();
    expect(decodeCursor(Buffer.from('{"nope":1}', "utf8").toString("base64url"))).toBeNull();
  });
});

describe("buildSeekWhere", () => {
  const spec: SeekSpec = {
    compare: (op, value) => ({ name: { [op]: value, mode: "insensitive" } }),
    tiebreak: (op, id, value) => ({
      name: { equals: value, mode: "insensitive" },
      id: { [op]: id },
    }),
  };

  it("builds an ascending seek with a tiebreaker", () => {
    const where = buildSeekWhere({ v: "Bob", id: "row-9" }, "asc", spec);
    expect(where).toEqual({
      AND: [
        {
          OR: [
            { name: { gt: "Bob", mode: "insensitive" } },
            { name: { equals: "Bob", mode: "insensitive" }, id: { gt: "row-9" } },
          ],
        },
      ],
    });
  });

  it("flips the operators for descending order", () => {
    const where = buildSeekWhere({ v: "Bob", id: "row-9" }, "desc", spec);
    expect(JSON.stringify(where)).toContain('"lt":"row-9"');
  });

  it("is empty without a usable cursor", () => {
    expect(buildSeekWhere(null, "asc", spec)).toEqual({});
    expect(buildSeekWhere({ v: null, id: "row-9" }, "desc", spec)).toEqual({});
  });
});

describe("toPageResult", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("detects a next page from the extra fetched row", () => {
    const rows = [
      { id: "a", v: 1 },
      { id: "b", v: 2 },
    ];
    const page = toPageResult(
      [...rows, { id: "c", v: 3 }],
      (row) => ({ v: String(row.v), id: row.id }),
      2
    );
    expect(page.rows).toHaveLength(2);
    expect(decodeCursor(page.nextCursor ?? undefined)).toEqual({ v: "2", id: "b" });
  });

  it("has no next cursor on the last page", () => {
    const page = toPageResult([{ id: "a", v: 1 }], (row) => ({ v: String(row.v), id: row.id }), 25);
    expect(page.rows).toHaveLength(1);
    expect(page.nextCursor).toBeNull();
  });
});
