import { beforeEach, describe, expect, it, vi } from "vitest";

import { assignRequestOwner } from "@sdk-e/requests/ownership";
import { common } from "@sdk-e/test-support/test-fixtures";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { findFirst: vi.fn(), update: vi.fn() };
  const requestActivity = { create: vi.fn() };
  const company = { findFirst: vi.fn() };
  return {
    prisma: { request, requestActivity, company, $transaction: vi.fn() },
    request,
    requestActivity,
    company,
  };
});

vi.mock("@sdk-e/db", () => ({
  getPrisma: () => mocks.prisma,
}));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

beforeEach(() => {
  mocks.request.findFirst.mockReset();
  mocks.request.update.mockReset();
  mocks.requestActivity.create.mockReset();
  mocks.company.findFirst.mockReset();
});

describe("assignRequestOwner", () => {
  it("assigns an owner and logs the activity", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", ownerId: null });
    mocks.request.update.mockResolvedValue({ id: "request-1", ownerId: "user-2" });
    mocks.requestActivity.create.mockResolvedValue({ id: "activity-1" });

    const result = await assignRequestOwner(
      principal("sdk-admin"),
      "company-1",
      "request-1",
      "user-2"
    );

    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: { ownerId: "user-2" },
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: {
        requestId: "request-1",
        companyId: "company-1",
        actorId: "user-1",
        type: "OWNER_ASSIGNED",
      },
    });
    expect(result).toEqual({ id: "request-1", ownerId: "user-2" });
  });

  it("reassigns an existing owner", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({ id: "request-1", ownerId: "user-3" });
    mocks.request.update.mockResolvedValue({ id: "request-1", ownerId: "user-2" });

    await assignRequestOwner(principal("sdk-admin"), "company-1", "request-1", "user-2");

    expect(mocks.request.update).toHaveBeenCalledWith({
      where: { id: "request-1" },
      data: { ownerId: "user-2" },
    });
  });

  it("throws when the request does not exist", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue(null);

    await expect(
      assignRequestOwner(principal("sdk-admin"), "company-1", "request-missing", "user-2")
    ).rejects.toThrow("Request not found.");
    expect(mocks.request.update).not.toHaveBeenCalled();
  });

  it("rejects when the target company is inactive", async () => {
    mocks.company.findFirst.mockResolvedValue(null);

    await expect(
      assignRequestOwner(principal("sdk-admin"), "company-1", "request-1", "user-2")
    ).rejects.toThrow("Company not found.");
    expect(mocks.request.update).not.toHaveBeenCalled();
  });

  it("rejects staff roles outside the allowed set", async () => {
    const finance = { ...common, kind: "sdk-staff", role: "FINANCE" } as const;

    await expect(assignRequestOwner(finance, "company-1", "request-1", "user-2")).rejects.toThrow(
      "SDK staff access is required."
    );
    expect(mocks.request.update).not.toHaveBeenCalled();
  });
});
