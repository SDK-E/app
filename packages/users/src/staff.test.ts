import { principal } from "@platform/test-support/test-fixtures";
import { updateStaffUser } from "@platform/users";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const user = { findUniqueOrThrow: vi.fn(), count: vi.fn(), update: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return { prisma: { user, auditEvent }, user, auditEvent };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  mocks.user.findUniqueOrThrow.mockReset();
  mocks.user.count.mockReset();
  mocks.user.update.mockReset();
  mocks.auditEvent.create.mockReset();
  mocks.auditEvent.create.mockResolvedValue({ id: "audit-1" });
});

describe("updateStaffUser", () => {
  it("updates the role of a staff member", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: "DELIVERY",
      memberships: [],
    });
    mocks.user.update.mockResolvedValue({ id: "user-2", sdkStaffRole: "FINANCE" });

    await expect(
      updateStaffUser(principal("sdk-admin"), "user-2", { role: "FINANCE" }),
    ).resolves.toEqual({ id: "user-2", sdkStaffRole: "FINANCE" });

    expect(mocks.user.update).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { role: "FINANCE" },
    });
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "staff_role.changed",
        targetId: "user-2",
        fromState: "DELIVERY",
        toState: "FINANCE",
      }),
    });
  });

  it("allows toggling the active flag on a delivery staff member", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: "DELIVERY",
      isActive: true,
      memberships: [],
    });
    mocks.user.update.mockResolvedValue({ id: "user-2", isActive: false });

    await expect(
      updateStaffUser(principal("sdk-admin"), "user-2", { isActive: false }),
    ).resolves.toBeDefined();

    expect(mocks.user.update).toHaveBeenCalledWith({
      where: { id: "user-2" },
      data: { isActive: false },
    });
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "user.active_changed",
        fromState: "ACTIVE",
        toState: "INACTIVE",
      }),
    });
  });

  it("writes no audit event when nothing changed", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: "DELIVERY",
      memberships: [],
    });
    mocks.user.update.mockResolvedValue({ id: "user-2", sdkStaffRole: "DELIVERY" });

    await updateStaffUser(principal("sdk-admin"), "user-2", { role: "DELIVERY" });

    expect(mocks.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects deactivating your own account", async () => {
    await expect(
      updateStaffUser(principal("sdk-admin"), "user-1", { isActive: false }),
    ).rejects.toThrow("You cannot deactivate your own account.");
    expect(mocks.user.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it("rejects staff roles for users who hold company memberships", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: null,
      memberships: [{ id: "membership-1" }],
    });

    await expect(
      updateStaffUser(principal("sdk-admin"), "user-2", { role: "FINANCE" }),
    ).rejects.toThrow("Company members cannot receive SDK staff roles.");
  });

  it("protects the last active SDK administrator from deactivation", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: "ADMIN",
      memberships: [],
    });
    mocks.user.count.mockResolvedValue(1);

    await expect(
      updateStaffUser(principal("sdk-admin"), "user-2", { isActive: false }),
    ).rejects.toThrow("The last active SDK administrator cannot be changed.");
  });

  it("protects the last active SDK administrator from demotion", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: "ADMIN",
      memberships: [],
    });
    mocks.user.count.mockResolvedValue(1);

    await expect(
      updateStaffUser(principal("sdk-admin"), "user-2", { role: "DELIVERY" }),
    ).rejects.toThrow("The last active SDK administrator cannot be changed.");
  });

  it("allows changing an admin when another active admin remains", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({
      id: "user-2",
      sdkStaffRole: "ADMIN",
      memberships: [],
    });
    mocks.user.count.mockResolvedValue(2);
    mocks.user.update.mockResolvedValue({ id: "user-2", isActive: false });

    await expect(
      updateStaffUser(principal("sdk-admin"), "user-2", { isActive: false }),
    ).resolves.toBeDefined();
    expect(mocks.user.count).toHaveBeenCalledWith({
      where: { sdkStaffRole: "ADMIN", isActive: true },
    });
  });

  it("rejects staff without the staff update permission", async () => {
    await expect(
      updateStaffUser(principal("delivery"), "user-2", { role: "FINANCE" }),
    ).rejects.toThrow("Missing permission: staff:update");
  });

  it("rejects client principals entirely", async () => {
    await expect(
      updateStaffUser(principal("administrator"), "user-2", { role: "FINANCE" }),
    ).rejects.toThrow("Missing permission: staff:update");
  });
});
