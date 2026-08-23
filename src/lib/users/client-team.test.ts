import { beforeEach, describe, expect, it, vi } from "vitest";

import { getClientTeamView } from "@/lib/users/client-team";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
  });
  const membership = make();
  const invitation = make();
  const companyAccessRequest = make();
  const company = { findUnique: vi.fn() };
  return { prisma: { membership, invitation, companyAccessRequest, company }, membership };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  vi.resetAllMocks();
  for (const model of [
    mocks.prisma.membership,
    mocks.prisma.invitation,
    mocks.prisma.companyAccessRequest,
  ]) {
    model.findMany.mockResolvedValue([]);
  }
});

describe("getClientTeamView", () => {
  it("rejects roles that cannot manage users", async () => {
    await expect(
      getClientTeamView(principal("member"), "company-1", "members", {})
    ).rejects.toThrow("User management is not available for this role.");
    expect(mocks.membership.findMany).not.toHaveBeenCalled();
  });

  it("scopes member queries to the principal's company", async () => {
    mocks.prisma.company.findUnique.mockResolvedValue({ id: "company-1", name: "Acme" });
    for (const model of [
      mocks.prisma.membership,
      mocks.prisma.invitation,
      mocks.prisma.companyAccessRequest,
    ]) {
      model.count.mockResolvedValue(3);
    }

    const view = await getClientTeamView(principal("owner"), "company-1", "members", {});

    const call = mocks.prisma.membership.findMany.mock.calls[0][0];
    expect(call.where.companyId).toBe("company-1");
    expect(view.kind).toBe("client");
    expect(view.counts).toEqual({ members: 3, invitations: 3, requests: 3 });
    expect(view.tab).toBe("members");
  });

  it("applies the search term to user name and email", async () => {
    mocks.prisma.company.findUnique.mockResolvedValue({ id: "company-1", name: "Acme" });

    await getClientTeamView(principal("owner"), "company-1", "members", { query: "alice" });

    const where = mocks.prisma.membership.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { user: { name: { contains: "alice", mode: "insensitive" } } },
      { user: { email: { contains: "alice", mode: "insensitive" } } },
    ]);
  });

  it("sorts members by name descending with a seek cursor", async () => {
    mocks.prisma.company.findUnique.mockResolvedValue({ id: "company-1", name: "Acme" });
    const cursor = encodeCursorForTest("Bob", "membership-9");

    await getClientTeamView(principal("owner"), "company-1", "members", {
      sort: "name",
      dir: "desc",
      cursor,
    });

    const call = mocks.prisma.membership.findMany.mock.calls[0][0];
    expect(call.orderBy).toEqual([{ user: { name: "desc" } }]);
    expect(JSON.stringify(call.where.AND)).toContain('"lt":"Bob"');
  });

  it("only fetches rows for the active tab", async () => {
    mocks.prisma.company.findUnique.mockResolvedValue({ id: "company-1", name: "Acme" });

    await getClientTeamView(principal("owner"), "company-1", "invitations", {});

    expect(mocks.prisma.membership.findMany).not.toHaveBeenCalled();
    expect(mocks.prisma.invitation.findMany).toHaveBeenCalled();
    expect(mocks.prisma.companyAccessRequest.findMany).not.toHaveBeenCalled();
  });

  it("returns a next cursor when the page is full", async () => {
    mocks.prisma.company.findUnique.mockResolvedValue({ id: "company-1", name: "Acme" });
    const rows = Array.from({ length: 26 }, (_, index) => ({
      id: `inv-${index}`,
      email: `p${index}@example.test`,
      clientRole: "VIEWER",
      expiresAt: new Date("2026-09-01T00:00:00.000Z"),
      deliveryStatus: "SENT",
      createdAt: new Date(`2026-08-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`),
    }));
    mocks.prisma.invitation.findMany.mockResolvedValue(rows);

    const view = await getClientTeamView(
      principal("administrator"),
      "company-1",
      "invitations",
      {}
    );

    expect(view.invitations.rows).toHaveLength(25);
    expect(view.invitations.nextCursor).toBeTruthy();
  });
});

function encodeCursorForTest(v: string, id: string) {
  return Buffer.from(JSON.stringify({ v, id }), "utf8").toString("base64url");
}
