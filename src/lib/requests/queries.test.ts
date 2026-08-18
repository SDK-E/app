import { beforeEach, describe, expect, it, vi } from "vitest";

import { getRequest, listRequests, requestDetailInclude } from "@/lib/requests/queries";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { findMany: vi.fn(), findFirst: vi.fn() };
  const company = { findFirst: vi.fn() };
  return { prisma: { request, company }, request, company };
});

vi.mock("@/lib/db", () => ({
  getPrisma: () => mocks.prisma,
}));

beforeEach(() => {
  mocks.request.findMany.mockReset();
  mocks.request.findFirst.mockReset();
  mocks.company.findFirst.mockReset();
});

describe("request queries", () => {
  it("lists requests for a client scoped to their company", async () => {
    mocks.request.findMany.mockResolvedValue([{ id: "request-1", title: "Modernize" }]);

    const result = await listRequests(principal("owner"), "company-1");

    expect(mocks.request.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: "company-1" },
        orderBy: { updatedAt: "desc" },
      })
    );
    expect(result).toEqual([{ id: "request-1", title: "Modernize" }]);
  });

  it("requires an active target company before listing for SDK staff", async () => {
    mocks.company.findFirst.mockResolvedValue(null);

    await expect(listRequests(principal("sdk-admin"), "company-1")).rejects.toThrow(
      "Company not found."
    );
    expect(mocks.request.findMany).not.toHaveBeenCalled();
  });

  it("requires an explicit company for SDK staff listings", async () => {
    await expect(listRequests(principal("sdk-admin"))).rejects.toThrow(
      "A target company is required for resource access."
    );
  });

  it("loads a full request detail for a tenant-scoped query", async () => {
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", title: "Modernize" });

    const result = await getRequest(principal("owner"), "request-1", "company-1");

    expect(mocks.request.findFirst).toHaveBeenCalledWith({
      where: { id: "request-1", companyId: "company-1" },
      include: requestDetailInclude,
    });
    expect(result).toEqual({ id: "request-1", title: "Modernize" });
  });

  it("returns a not-found error for a cross-company detail request", async () => {
    await expect(getRequest(principal("owner"), "request-1", "company-2")).rejects.toThrow(
      "Company not found."
    );
    expect(mocks.request.findFirst).not.toHaveBeenCalled();
  });

  it("throws a not-found error when the request is missing", async () => {
    mocks.request.findFirst.mockResolvedValue(null);

    await expect(getRequest(principal("owner"), "request-missing", "company-1")).rejects.toThrow(
      "Request not found."
    );
  });
});
