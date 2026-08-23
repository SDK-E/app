import { beforeEach, describe, expect, it, vi } from "vitest";

import { assignCompanyMembership, assignSdkStaffRole } from "@sdk-e/auth/identity-management";
import { IdentityError } from "@sdk-e/auth/identity";

const mocks = vi.hoisted(() => {
  const user = { findUniqueOrThrow: vi.fn(), update: vi.fn() };
  const membership = { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() };
  return { prisma: { user, membership, $transaction: vi.fn() }, user, membership };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  mocks.user.findUniqueOrThrow.mockReset();
  mocks.user.update.mockReset();
  mocks.membership.findUnique.mockReset();
  mocks.membership.findFirst.mockReset();
  mocks.membership.create.mockReset();
  mocks.prisma.$transaction.mockReset();
  mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
});

describe("assignCompanyMembership", () => {
  it("creates a membership without an inviter", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({ id: "user-9", sdkStaffRole: null });
    mocks.membership.create.mockResolvedValue({ id: "membership-1" });

    const result = await assignCompanyMembership({
      userId: "user-9",
      companyId: "company-1",
      role: "PROJECT_MEMBER",
    });

    expect(mocks.membership.create).toHaveBeenCalledWith({
      data: {
        userId: "user-9",
        companyId: "company-1",
        role: "PROJECT_MEMBER",
        invitedBy: undefined,
        invitedAt: null,
        joinedAt: expect.any(Date),
      },
    });
    expect(result).toEqual({ id: "membership-1" });
  });

  it("records the inviter and invitation time when present", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({ id: "user-9", sdkStaffRole: null });
    mocks.membership.create.mockResolvedValue({ id: "membership-1" });
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-17T12:00:00.000Z"));

    await assignCompanyMembership({
      userId: "user-9",
      companyId: "company-1",
      role: "BILLING",
      invitedBy: "user-1",
    });

    expect(mocks.membership.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        role: "BILLING",
        invitedBy: "user-1",
        invitedAt: new Date("2026-08-17T12:00:00.000Z"),
      }),
    });
    vi.useRealTimers();
  });

  it("refuses memberships for SDK staff users", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({ id: "user-9", sdkStaffRole: "DELIVERY" });

    await expect(
      assignCompanyMembership({ userId: "user-9", companyId: "company-1", role: "VIEWER" })
    ).rejects.toThrow(IdentityError);
    expect(mocks.membership.create).not.toHaveBeenCalled();
  });
});

describe("assignSdkStaffRole", () => {
  it("promotes a non-member user to SDK staff", async () => {
    mocks.membership.findFirst.mockResolvedValue(null);
    mocks.user.update.mockResolvedValue({ id: "user-9", sdkStaffRole: "FINANCE" });

    const result = await assignSdkStaffRole("user-9", "FINANCE");

    expect(mocks.user.update).toHaveBeenCalledWith({
      where: { id: "user-9" },
      data: { sdkStaffRole: "FINANCE" },
    });
    expect(result).toEqual({ id: "user-9", sdkStaffRole: "FINANCE" });
  });

  it("refuses staff roles for users with company memberships", async () => {
    mocks.membership.findFirst.mockResolvedValue({ id: "membership-1" });

    await expect(assignSdkStaffRole("user-9", "FINANCE")).rejects.toThrow(
      "Company members cannot receive SDK staff roles."
    );
    expect(mocks.user.update).not.toHaveBeenCalled();
  });
});
