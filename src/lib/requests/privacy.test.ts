import { beforeEach, describe, expect, it, vi } from "vitest";

import { assignRequestOwner } from "@/lib/requests/ownership";
import { convertRequestToOpportunity } from "@/lib/requests/opportunities";
import { getRequest, listRequests } from "@/lib/requests/queries";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() };
  const opportunity = { create: vi.fn() };
  const requestActivity = { create: vi.fn() };
  const company = { findFirst: vi.fn() };
  return {
    prisma: { request, opportunity, requestActivity, company, $transaction: vi.fn() },
    request,
    opportunity,
    requestActivity,
    company,
  };
});

vi.mock("@/lib/db", () => ({
  getPrisma: () => mocks.prisma,
}));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

beforeEach(() => {
  mocks.request.findMany.mockReset();
  mocks.request.findFirst.mockReset();
  mocks.request.update.mockReset();
  mocks.opportunity.create.mockReset();
  mocks.requestActivity.create.mockReset();
  mocks.company.findFirst.mockReset();
});

describe("privacy boundary", () => {
  it("listRequests throws for provider principals", async () => {
    await expect(listRequests(principal("provider"), "company-1")).rejects.toThrow(
      "Company not found."
    );
    expect(mocks.request.findMany).not.toHaveBeenCalled();
  });

  it("getRequest throws for provider principals", async () => {
    await expect(getRequest(principal("provider"), "request-1", "company-1")).rejects.toThrow(
      "Company not found."
    );
    expect(mocks.request.findFirst).not.toHaveBeenCalled();
  });

  it("assignRequestOwner throws for provider principals", async () => {
    await expect(
      assignRequestOwner(principal("provider"), "company-1", "request-1", "user-2")
    ).rejects.toThrow("SDK staff access is required.");
    expect(mocks.request.update).not.toHaveBeenCalled();
  });

  it("convertRequestToOpportunity throws for provider principals", async () => {
    await expect(
      convertRequestToOpportunity(principal("provider"), "company-1", "request-1")
    ).rejects.toThrow("SDK staff access is required.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });
});
