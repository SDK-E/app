import { parseUsersListQuery, usersListHref } from "@platform/users/list-links";
import { describe, expect, it } from "vitest";

describe("parseUsersListQuery", () => {
  it("parses tab, search, sort and pagination state", () => {
    const query = parseUsersListQuery({
      tab: "invitations",
      q: "alice",
      sort: "email",
      dir: "desc",
      cursor: "abc",
      back: "1",
      company: "company-1",
      status: "inactive",
    });
    expect(query).toEqual({
      tab: "invitations",
      q: "alice",
      sort: "email",
      dir: "desc",
      cursor: "abc",
      back: true,
      company: "company-1",
      status: "inactive",
    });
  });

  it("falls back to safe defaults for hostile input", () => {
    const query = parseUsersListQuery({ tab: "../../etc", dir: ["sideways"], status: "" });
    expect(query.tab).toBe("members");
    expect(query.dir).toBe("asc");
    expect(query.status).toBeUndefined();
  });
});

describe("usersListHref", () => {
  it("keeps filters and drops pagination when moving between tabs", () => {
    const href = usersListHref("/en/app/users", {
      tab: "requests",
      q: "bob",
      sort: "name",
      dir: "desc",
      cursor: "stale",
      back: true,
    });
    expect(href).toBe("/en/app/users?tab=requests&q=bob&sort=name&dir=desc");
  });

  it("appends pagination when explicitly overridden", () => {
    const href = usersListHref(
      "/en/app/users",
      { tab: "members", q: "bob" },
      { cursor: "next-1", back: false },
    );
    expect(href).toBe("/en/app/users?q=bob&cursor=next-1");
  });

  it("marks backward navigation", () => {
    const href = usersListHref(
      "/en/app/users",
      { tab: "members" },
      { cursor: "prev-1", back: true },
    );
    expect(href).toBe("/en/app/users?cursor=prev-1&back=1");
  });

  it("returns the bare path for defaults", () => {
    expect(usersListHref("/en/app/users", { tab: "members" })).toBe("/en/app/users");
  });
});
