import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserManagementData } from "@/lib/users";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const make = () => vi.fn();
  return {
    prisma: {
      membership: { findMany: make() },
      user: { findMany: make() },
      company: { findMany: make(), findUnique: make() },
      invitation: { findMany: make(), count: make() },
      companyAccessRequest: { findMany: make() },
    },
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("getUserManagementData", () => {
  it("returns client management data for an owner", async () => {
    const memberships = [{ id: "membership-1" }];
    const invitations = [{ id: "inv-1" }];
    const accessRequests = [{ id: "req-1" }];
    mocks.prisma.membership.findMany.mockResolvedValue(memberships);
    mocks.prisma.invitation.findMany.mockResolvedValue(invitations);
    mocks.prisma.companyAccessRequest.findMany.mockResolvedValue(accessRequests);
    mocks.prisma.company.findUnique.mockResolvedValue({ id: "company-1", name: "Acme" });

    const result = await getUserManagementData(principal("owner"), "company-1");

    expect(mocks.prisma.membership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1" } })
    );
    expect(result).toMatchObject({
      kind: "client",
      memberships,
      invitations,
      accessRequests,
      pendingInvitationCount: 1,
      company: { id: "company-1", name: "Acme" },
    });
  });

  it("rejects client roles that cannot manage users", async () => {
    await expect(getUserManagementData(principal("member"), "company-1")).rejects.toThrow(
      "User management is not available for this role."
    );
    expect(mocks.prisma.membership.findMany).not.toHaveBeenCalled();
  });

  it("rejects non-admin SDK staff", async () => {
    await expect(getUserManagementData(principal("delivery"))).rejects.toThrow(
      "SDK administrator access is required."
    );
  });

  it("returns the staff directory for an SDK administrator", async () => {
    mocks.prisma.user.findMany.mockResolvedValue([{ id: "user-2" }]);
    mocks.prisma.company.findMany.mockResolvedValue([{ id: "company-1" }]);
    mocks.prisma.invitation.findMany.mockResolvedValue([{ id: "inv-1" }]);
    mocks.prisma.invitation.count.mockResolvedValue(1);
    mocks.prisma.companyAccessRequest.findMany.mockResolvedValue([]);

    const result = await getUserManagementData(principal("sdk-admin"));

    expect(mocks.prisma.user.findMany).toHaveBeenCalled();
    expect(mocks.prisma.invitation.count).toHaveBeenCalledWith({
      where: { acceptedAt: null, revokedAt: null },
    });
    expect(result).toMatchObject({
      kind: "staff",
      users: [{ id: "user-2" }],
      companies: [{ id: "company-1" }],
      invitations: [{ id: "inv-1" }],
      accessRequests: [],
      pendingInvitationCount: 1,
    });
  });
});
