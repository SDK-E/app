import { beforeEach, describe, expect, it, vi } from "vitest";

import { setAccountActive, updateUserName } from "@sdk-e/users";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const user = { findUniqueOrThrow: vi.fn(), update: vi.fn() };
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  return { prisma: { user, auditEvent }, user, auditEvent };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  mocks.user.findUniqueOrThrow.mockReset();
  mocks.user.update.mockReset();
  mocks.auditEvent.create.mockReset();
  mocks.auditEvent.create.mockResolvedValue({ id: "audit-1" });
});

describe("setAccountActive", () => {
  it("deactivates a client account and records the change", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({ id: "user-9", isActive: true });
    mocks.user.update.mockResolvedValue({ id: "user-9", isActive: false });

    await setAccountActive(principal("sdk-admin"), "user-9", false);

    expect(mocks.user.update).toHaveBeenCalledWith({
      where: { id: "user-9" },
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

  it("is a no-op when the account already has the requested state", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({ id: "user-9", isActive: true });

    await setAccountActive(principal("sdk-admin"), "user-9", true);

    expect(mocks.user.update).not.toHaveBeenCalled();
    expect(mocks.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects staff targets and self-deactivation", async () => {
    mocks.user.findUniqueOrThrow
      .mockResolvedValueOnce({ id: "user-9", isActive: true, sdkStaffRole: "ADMIN" })
      .mockResolvedValueOnce({ id: "user-9", isActive: true, sdkStaffRole: null });

    await expect(setAccountActive(principal("sdk-admin"), "user-9", false)).rejects.toThrow(
      "Use SDK staff management for staff accounts."
    );
    await expect(setAccountActive(principal("sdk-admin"), "user-1", false)).rejects.toThrow(
      "You cannot deactivate your own account."
    );
  });

  it("rejects principals without the activation permission", async () => {
    await expect(setAccountActive(principal("delivery"), "user-9", true)).rejects.toThrow(
      "Missing permission: user:activate"
    );
  });
});

describe("updateUserName", () => {
  it("corrects a name and records the correction", async () => {
    mocks.user.findUniqueOrThrow.mockResolvedValue({ name: "Typo Name" });
    mocks.user.update.mockResolvedValue({ id: "user-9", name: "Correct Name" });

    await updateUserName(principal("sdk-admin"), "user-9", "  Correct Name  ");

    expect(mocks.user.update).toHaveBeenCalledWith({
      where: { id: "user-9" },
      data: { name: "Correct Name" },
    });
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "user.name_corrected",
        fromState: "Typo Name",
        toState: "Correct Name",
      }),
    });
  });

  it("rejects blank names", async () => {
    await expect(updateUserName(principal("sdk-admin"), "user-9", "   ")).rejects.toThrow(
      "Enter a name."
    );
    expect(mocks.user.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it("rejects principals without the user update permission", async () => {
    await expect(updateUserName(principal("viewer"), "user-9", "Name")).rejects.toThrow(
      "Missing permission: user:update"
    );
  });
});
