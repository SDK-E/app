import { principal } from "@platform/test-support/test-fixtures";
import { approveCompanyAccessRequest, declineCompanyAccessRequest } from "@platform/users";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  });
  const companyAccessRequest = make();
  const membership = { findFirst: vi.fn() };
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  return {
    prisma: { companyAccessRequest, membership, auditEvent },
    companyAccessRequest,
    membership,
    auditEvent,
    assignCompanyMembership: vi.fn(),
  };
});

vi.mock("@platform/db", () => ({
  getPrisma: () => mocks.prisma,
}));

vi.mock("@platform/auth/identity-management", () => ({
  assignCompanyMembership: mocks.assignCompanyMembership,
}));

const pendingRequest = {
  id: "request-1",
  userId: "user-9",
  companyId: "company-1",
  status: "PENDING" as const,
  user: { sdkStaffRole: null },
};

beforeEach(() => {
  mocks.companyAccessRequest.findUnique.mockReset();
  mocks.companyAccessRequest.update.mockReset();
  mocks.membership.findFirst.mockReset();
  mocks.auditEvent.create.mockClear();
  mocks.assignCompanyMembership.mockReset();
});

describe("approveCompanyAccessRequest", () => {
  it("approves a pending request and assigns the default viewer role", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.assignCompanyMembership.mockResolvedValue({ id: "membership-1" });
    mocks.companyAccessRequest.update.mockResolvedValue({ ...pendingRequest, status: "APPROVED" });

    const result = await approveCompanyAccessRequest(principal("owner"), "request-1", {});

    expect(mocks.assignCompanyMembership).toHaveBeenCalledWith({
      userId: "user-9",
      companyId: "company-1",
      role: "VIEWER",
      invitedBy: "user-1",
    });
    expect(mocks.companyAccessRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "request-1" },
        data: expect.objectContaining({ status: "APPROVED", resolvedBy: "user-1" }),
      }),
    );
    expect(result.membership).toEqual({ id: "membership-1" });
  });

  it("honours a requested member role", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.assignCompanyMembership.mockResolvedValue({ id: "membership-1" });
    mocks.companyAccessRequest.update.mockResolvedValue({ ...pendingRequest, status: "APPROVED" });

    await approveCompanyAccessRequest(principal("owner"), "request-1", { role: "PROJECT_MEMBER" });

    expect(mocks.assignCompanyMembership).toHaveBeenCalledWith(
      expect.objectContaining({ role: "PROJECT_MEMBER" }),
    );
  });

  it("lets a company owner grant administrator access", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.assignCompanyMembership.mockResolvedValue({ id: "membership-1" });
    mocks.companyAccessRequest.update.mockResolvedValue({ ...pendingRequest, status: "APPROVED" });

    await approveCompanyAccessRequest(principal("owner"), "request-1", { role: "ADMINISTRATOR" });

    expect(mocks.assignCompanyMembership).toHaveBeenCalledWith(
      expect.objectContaining({ role: "ADMINISTRATOR" }),
    );
  });

  it("rejects granting ownership from user management", async () => {
    await expect(
      approveCompanyAccessRequest(principal("owner"), "request-1", { role: "OWNER" }),
    ).rejects.toThrow("Ownership cannot be granted");
    expect(mocks.companyAccessRequest.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a client non-owner granting administrator access", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    await expect(
      approveCompanyAccessRequest(principal("administrator"), "request-1", {
        role: "ADMINISTRATOR",
      }),
    ).rejects.toThrow("Only a company owner can grant administrator access.");
  });

  it("rejects a request that has already been resolved", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      ...pendingRequest,
      status: "APPROVED",
    });

    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "already been resolved",
    );
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects an SDK staff member as the target", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      ...pendingRequest,
      user: { sdkStaffRole: "ADMIN" },
    });

    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "SDK staff",
    );
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects a user who already holds an assignment", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    mocks.membership.findFirst.mockResolvedValue({ id: "membership-9" });

    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "This user is already a member of this company.",
    );
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects cross-company approval for client approvers", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      ...pendingRequest,
      companyId: "company-2",
    });

    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "Cross-company access is denied.",
    );
  });

  it("rejects delivery staff without membership management", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    await expect(
      approveCompanyAccessRequest(principal("delivery"), "request-1", {}),
    ).rejects.toThrow("Missing permission: membership:update");
  });

  it("throws when the request does not exist", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(null);

    await expect(
      approveCompanyAccessRequest(principal("owner"), "request-missing", {}),
    ).rejects.toThrow("Access request not found.");
  });
});

describe("declineCompanyAccessRequest", () => {
  it("declines a pending request and records the approver", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue(pendingRequest);
    mocks.companyAccessRequest.update.mockResolvedValue({ ...pendingRequest, status: "DECLINED" });

    await declineCompanyAccessRequest(principal("owner"), "request-1");

    expect(mocks.companyAccessRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "request-1" },
        data: expect.objectContaining({ status: "DECLINED", resolvedBy: "user-1" }),
      }),
    );
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects declining a resolved request", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      ...pendingRequest,
      status: "APPROVED",
    });

    await expect(declineCompanyAccessRequest(principal("owner"), "request-1")).rejects.toThrow(
      "already been resolved",
    );
    expect(mocks.companyAccessRequest.update).not.toHaveBeenCalled();
  });
});
