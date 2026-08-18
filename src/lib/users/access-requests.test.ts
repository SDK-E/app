import { beforeEach, describe, expect, it, vi } from "vitest";

import { listCompanyAccessRequests, requestCompanyAccess } from "@/lib/users";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => ({
  company: { findFirst: vi.fn() },
  membership: { findFirst: vi.fn() },
  companyAccessRequest: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    company: mocks.company,
    membership: mocks.membership,
    companyAccessRequest: mocks.companyAccessRequest,
  }),
}));

beforeEach(() => {
  mocks.company.findFirst.mockReset();
  mocks.membership.findFirst.mockReset();
  mocks.companyAccessRequest.findFirst.mockReset();
  mocks.companyAccessRequest.findMany.mockReset();
  mocks.companyAccessRequest.create.mockReset();
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
    await listCompanyAccessRequests(principal("owner"), { companyId: "company-1" });
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
