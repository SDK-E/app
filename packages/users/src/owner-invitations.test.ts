import { principal } from "@platform/test-support/test-fixtures";
import { createClientInvitation } from "@platform/users";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findFirst: vi.fn(),
    create: vi.fn(),
  });
  const invitation = make();
  const user = { findFirst: vi.fn() };
  const company = { findFirst: vi.fn() };
  const membership = { findFirst: vi.fn() };
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  const prisma = { invitation, user, company, membership, auditEvent };
  return { prisma, invitation, user, company, membership, auditEvent };
});

vi.mock("@platform/db", () => ({
  getPrisma: () => mocks.prisma,
}));

describe("createClientInvitation (owner)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("lets an SDK administrator invite the first owner", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.invitation.create.mockImplementation(async ({ data }) => ({ id: "inv-1", ...data }));

    const result = await createClientInvitation(
      principal("sdk-admin"),
      { email: "owner@example.com", role: "OWNER" },
      "company-2",
    );

    expect(mocks.membership.findFirst).toHaveBeenCalledWith({
      where: { companyId: "company-2", role: "OWNER" },
      select: { id: true },
    });
    expect(mocks.invitation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "CLIENT",
          companyId: "company-2",
          clientRole: "OWNER",
          email: "owner@example.com",
        }),
      }),
    );
    expect(result.invitation.clientRole).toBe("OWNER");
  });

  it("rejects a second owner for a company that already has one", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.membership.findFirst.mockResolvedValue({ id: "m1" });

    await expect(
      createClientInvitation(
        principal("sdk-admin"),
        { email: "other@example.com", role: "OWNER" },
        "company-1",
      ),
    ).rejects.toThrow("already has an owner");
    expect(mocks.invitation.create).not.toHaveBeenCalled();
  });

  it("rejects owner invitations from company members", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.membership.findFirst.mockResolvedValue(null);

    await expect(
      createClientInvitation(
        principal("owner"),
        { email: "client@example.com", role: "OWNER" },
        "company-1",
      ),
    ).rejects.toThrow("Only SDK administrators can invite a company owner.");
    expect(mocks.invitation.create).not.toHaveBeenCalled();
  });

  it("rejects owner invitations from non-admin staff", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });

    await expect(
      createClientInvitation(
        principal("delivery"),
        { email: "client@example.com", role: "OWNER" },
        "company-1",
      ),
    ).rejects.toThrow("Missing permission: membership:invite");
    expect(mocks.invitation.create).not.toHaveBeenCalled();
  });
});
