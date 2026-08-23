import { beforeEach, describe, expect, it, vi } from "vitest";

import { assignCompanyMemberDirectly } from "@/lib/users";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const company = { findFirst: vi.fn() };
  const user = { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() };
  const membership = { findFirst: vi.fn() };
  const companyAccessRequest = { updateMany: vi.fn() };
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  const assignCompanyMembership = vi.fn();
  return {
    prisma: { company, user, membership, companyAccessRequest, auditEvent },
    company,
    user,
    membership,
    companyAccessRequest,
    auditEvent,
    assignCompanyMembership,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

vi.mock("@/lib/auth/identity-management", () => ({
  assignCompanyMembership: mocks.assignCompanyMembership,
}));

const memberUser = {
  id: "user-9",
  email: "new.member@example.test",
  name: "New Member",
  sdkStaffRole: null,
  provider: null,
};

beforeEach(() => {
  for (const model of [
    mocks.company,
    mocks.user,
    mocks.membership,
    mocks.companyAccessRequest,
    mocks.auditEvent,
  ]) {
    for (const fn of Object.values(model)) fn.mockReset();
  }
  mocks.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  mocks.assignCompanyMembership.mockReset();
});

describe("assignCompanyMemberDirectly", () => {
  it("assigns an unassigned user to a company with a role", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-2", name: "Acme" });
    mocks.user.findUnique.mockResolvedValue(memberUser);
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.companyAccessRequest.updateMany.mockResolvedValue({ count: 0 });
    const membership = { id: "membership-new" };
    mocks.assignCompanyMembership.mockResolvedValue(membership);

    const result = await assignCompanyMemberDirectly(principal("sdk-admin"), {
      userId: "user-9",
      companyId: "company-2",
      role: "PROJECT_MEMBER",
    });

    expect(result.membership).toEqual(membership);
    expect(mocks.assignCompanyMembership).toHaveBeenCalledWith({
      userId: "user-9",
      companyId: "company-2",
      role: "PROJECT_MEMBER",
      invitedBy: "user-1",
    });
    expect(mocks.companyAccessRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PENDING", userId: "user-9", companyId: "company-2" },
      })
    );
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "membership.assigned",
        companyId: "company-2",
        targetId: "membership-new",
        toState: "PROJECT_MEMBER",
      }),
    });
  });

  it("supersedes a pending access request for the same person and company", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-2" });
    mocks.user.findUnique.mockResolvedValue(memberUser);
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.companyAccessRequest.updateMany.mockResolvedValue({ count: 1 });
    mocks.assignCompanyMembership.mockResolvedValue({ id: "membership-new" });

    await assignCompanyMemberDirectly(principal("sdk-admin"), {
      userId: "user-9",
      companyId: "company-2",
      role: "VIEWER",
    });

    expect(mocks.companyAccessRequest.updateMany).toHaveBeenCalled();
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: expect.objectContaining({ supersededRequestId: true }),
      }),
    });
  });

  it("lets an SDK administrator assign the first owner", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-2" });
    mocks.user.findUnique.mockResolvedValue(memberUser);
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.companyAccessRequest.updateMany.mockResolvedValue({ count: 0 });
    mocks.assignCompanyMembership.mockResolvedValue({ id: "membership-owner" });

    await assignCompanyMemberDirectly(principal("sdk-admin"), {
      userId: "user-9",
      companyId: "company-2",
      role: "OWNER",
    });

    expect(mocks.assignCompanyMembership).toHaveBeenCalledWith(
      expect.objectContaining({ role: "OWNER" })
    );
  });

  it("rejects a second owner", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-2" });
    mocks.user.findUnique.mockResolvedValue(memberUser);
    mocks.membership.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "owner-membership" });

    await expect(
      assignCompanyMemberDirectly(principal("sdk-admin"), {
        userId: "user-9",
        companyId: "company-2",
        role: "OWNER",
      })
    ).rejects.toThrow("This company already has an owner.");
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects SDK staff and provider targets", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-2" });
    mocks.user.findUnique
      .mockResolvedValueOnce({ ...memberUser, sdkStaffRole: "ADMIN" })
      .mockResolvedValueOnce({ ...memberUser, provider: { id: "provider-1" } });

    await expect(
      assignCompanyMemberDirectly(principal("sdk-admin"), {
        userId: "user-9",
        companyId: "company-2",
        role: "VIEWER",
      })
    ).rejects.toThrow("SDK staff accounts cannot receive company memberships.");
    await expect(
      assignCompanyMemberDirectly(principal("sdk-admin"), {
        userId: "user-9",
        companyId: "company-2",
        role: "VIEWER",
      })
    ).rejects.toThrow("Provider accounts cannot receive company memberships.");
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects users who are already members of the company", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-2" });
    mocks.user.findUnique.mockResolvedValue(memberUser);
    mocks.membership.findFirst.mockResolvedValue({ id: "membership-existing" });

    await expect(
      assignCompanyMemberDirectly(principal("sdk-admin"), {
        userId: "user-9",
        companyId: "company-2",
        role: "VIEWER",
      })
    ).rejects.toThrow("This user is already a member of this company.");
  });

  it("rejects principals without the assignment permission", async () => {
    await expect(
      assignCompanyMemberDirectly(principal("delivery"), {
        userId: "user-9",
        companyId: "company-2",
        role: "VIEWER",
      })
    ).rejects.toThrow("Missing permission: membership:create");
    await expect(
      assignCompanyMemberDirectly(principal("owner"), {
        userId: "user-9",
        companyId: "company-1",
        role: "VIEWER",
      })
    ).rejects.toThrow("Missing permission: membership:create");
    expect(mocks.company.findFirst).not.toHaveBeenCalled();
  });
});
