import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  company: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  companyAccessRequest: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  membership: { findUnique: vi.fn() },
  assignCompanyMembership: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    company: mocks.company,
    companyAccessRequest: mocks.companyAccessRequest,
    membership: mocks.membership,
  }),
}));

vi.mock("@/lib/identity-management", () => ({
  assignCompanyMembership: mocks.assignCompanyMembership,
}));

import {
  approveCompanyAccessRequest,
  listCompanyAccessRequests,
  regenerateCompanyAccessCode,
  requestCompanyAccess,
} from "@/lib/user-management";
import type { AppPrincipal } from "@/types";

const common = {
  id: "user-1",
  auth0Sub: "auth0|1",
  email: "user@example.test",
  name: "User",
  avatarUrl: null,
  preferredLocale: "en",
};

function principal(
  kind: "owner" | "administrator" | "member" | "sdk-admin" | "delivery" | "unassigned"
): AppPrincipal {
  if (kind === "unassigned") return { ...common, kind: "unassigned" };
  if (kind === "sdk-admin" || kind === "delivery")
    return { ...common, kind: "sdk-staff", role: kind === "sdk-admin" ? "ADMIN" : "DELIVERY" };
  return {
    ...common,
    kind: "client",
    companyId: "company-1",
    companyName: "Company",
    role:
      kind === "owner" ? "OWNER" : kind === "administrator" ? "ADMINISTRATOR" : "PROJECT_MEMBER",
  };
}

beforeEach(() => {
  mocks.company.findFirst.mockReset();
  mocks.company.findUnique.mockReset();
  mocks.company.update.mockReset();
  mocks.companyAccessRequest.findFirst.mockReset();
  mocks.companyAccessRequest.findMany.mockReset();
  mocks.companyAccessRequest.create.mockReset();
  mocks.companyAccessRequest.findUnique.mockReset();
  mocks.companyAccessRequest.update.mockReset();
  mocks.membership.findUnique.mockReset();
  mocks.assignCompanyMembership.mockReset();
});

describe("requestCompanyAccess", () => {
  it("only allows unassigned users to request access", async () => {
    await expect(requestCompanyAccess(principal("owner"), { code: "A1B2-C3D4" })).rejects.toThrow(
      "Only unassigned users"
    );
    expect(mocks.company.findFirst).not.toHaveBeenCalled();
  });

  it("rejects owner and administrator role requests", async () => {
    await expect(
      requestCompanyAccess(principal("unassigned"), { code: "A1B2-C3D4", requestedRole: "OWNER" })
    ).rejects.toThrow("cannot be requested");
    await expect(
      requestCompanyAccess(principal("unassigned"), {
        code: "A1B2-C3D4",
        requestedRole: "ADMINISTRATOR",
      })
    ).rejects.toThrow("cannot be requested");
    expect(mocks.company.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an unknown code without disclosing the company", async () => {
    mocks.company.findFirst.mockResolvedValue(null);
    await expect(
      requestCompanyAccess(principal("unassigned"), { code: "Z9Y8-X7W6" })
    ).rejects.toThrow("was not found");
    expect(mocks.companyAccessRequest.create).not.toHaveBeenCalled();
  });

  it("resolves the code case-insensitively against an active company", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1", name: "Company" });
    mocks.companyAccessRequest.findFirst.mockResolvedValue(null);
    mocks.companyAccessRequest.create.mockResolvedValue({
      id: "request-1",
      company: { name: "Company" },
    });
    await requestCompanyAccess(principal("unassigned"), { code: "  a1b2-c3d4 " });
    expect(mocks.company.findFirst).toHaveBeenCalledWith({
      where: { accessCode: "A1B2-C3D4", isActive: true },
    });
    expect(mocks.companyAccessRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { userId: "user-1", companyId: "company-1", requestedRole: "VIEWER" },
      })
    );
  });

  it("enforces a single pending request per company", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1", name: "Company" });
    mocks.companyAccessRequest.findFirst.mockResolvedValue({ id: "request-1", status: "PENDING" });
    await expect(
      requestCompanyAccess(principal("unassigned"), { code: "A1B2-C3D4" })
    ).rejects.toThrow("pending access request");
    expect(mocks.companyAccessRequest.create).not.toHaveBeenCalled();
  });
});

describe("listCompanyAccessRequests", () => {
  it("scopes client approvers to their own company and pending status", async () => {
    mocks.companyAccessRequest.findMany.mockResolvedValue([]);
    await listCompanyAccessRequests(principal("owner"));
    expect(mocks.companyAccessRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1", status: "PENDING" } })
    );
  });

  it("rejects delivery staff without membership management", async () => {
    await expect(listCompanyAccessRequests(principal("delivery"))).rejects.toThrow(
      "Missing permission: membership:update"
    );
  });

  it("lets SDK administrators list requests for any company", async () => {
    mocks.companyAccessRequest.findMany.mockResolvedValue([]);
    await listCompanyAccessRequests(principal("sdk-admin"), { companyId: "company-2" });
    expect(mocks.companyAccessRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-2", status: "PENDING" } })
    );
  });
});

describe("approveCompanyAccessRequest", () => {
  it("rejects users without membership management", async () => {
    await expect(approveCompanyAccessRequest(principal("member"), "request-1", {})).rejects.toThrow(
      "Missing permission: membership:update"
    );
  });

  it("denies cross-company approval for a client approver", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-2",
      companyId: "company-2",
      status: "PENDING",
      user: { sdkStaffRole: null },
    });
    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "Cross-company access is denied"
    );
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("rejects a request that has already been resolved", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-2",
      companyId: "company-1",
      status: "APPROVED",
      user: { sdkStaffRole: null },
    });
    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "already been resolved"
    );
  });

  it("rejects SDK staff users as membership recipients", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-2",
      companyId: "company-1",
      status: "PENDING",
      user: { sdkStaffRole: "DELIVERY" },
    });
    await expect(approveCompanyAccessRequest(principal("owner"), "request-1", {})).rejects.toThrow(
      "SDK staff"
    );
    expect(mocks.assignCompanyMembership).not.toHaveBeenCalled();
  });

  it("grants the membership and marks the request approved", async () => {
    mocks.companyAccessRequest.findUnique.mockResolvedValue({
      id: "request-1",
      userId: "user-2",
      companyId: "company-1",
      status: "PENDING",
      user: { sdkStaffRole: null },
    });
    mocks.membership.findUnique.mockResolvedValue(null);
    mocks.assignCompanyMembership.mockResolvedValue({ id: "membership-1" });
    mocks.companyAccessRequest.update.mockResolvedValue({ id: "request-1" });
    await approveCompanyAccessRequest(principal("owner"), "request-1", { role: "VIEWER" });
    expect(mocks.assignCompanyMembership).toHaveBeenCalledWith({
      userId: "user-2",
      companyId: "company-1",
      role: "VIEWER",
      invitedBy: "user-1",
    });
    const updateCall = mocks.companyAccessRequest.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: "request-1" });
    expect(updateCall.data).toMatchObject({ status: "APPROVED", resolvedBy: "user-1" });
  });
});

describe("regenerateCompanyAccessCode", () => {
  it("requires the company update permission", async () => {
    await expect(regenerateCompanyAccessCode(principal("member"))).rejects.toThrow(
      "Missing permission: company:update"
    );
    expect(mocks.company.update).not.toHaveBeenCalled();
  });

  it("requires SDK staff to select a target company", async () => {
    await expect(regenerateCompanyAccessCode(principal("sdk-admin"))).rejects.toThrow(
      "must select a target company"
    );
  });

  it("sets a new access code for the client's own company", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-1", accessCode: "OLD1-CODE" });
    mocks.company.update.mockResolvedValue({ id: "company-1", accessCode: "NEW1-CODE" });
    const updated = await regenerateCompanyAccessCode(principal("owner"));
    expect(updated.accessCode).not.toBe("OLD1-CODE");
    expect(mocks.company.update).toHaveBeenCalledWith({
      where: { id: "company-1" },
      data: expect.objectContaining({
        accessCode: expect.stringMatching(/^[0-9A-F]{4}-[0-9A-F]{4}$/),
      }),
    });
  });
});
