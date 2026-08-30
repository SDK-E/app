import { principal } from "@platform/test-support/test-fixtures";
import { removeMembership, updateMembershipRole } from "@platform/users";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const membership = {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  return { prisma: { membership, auditEvent }, membership, auditEvent };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));

const membership = (role: string, overrides: Record<string, unknown> = {}) => ({
  id: "membership-1",
  userId: "user-2",
  companyId: "company-1",
  role,
  ...overrides,
});

beforeEach(() => {
  mocks.membership.findUniqueOrThrow.mockReset();
  mocks.membership.update.mockReset();
  mocks.membership.delete.mockReset();
  mocks.membership.count.mockReset();
  mocks.auditEvent.create.mockClear();
});

describe("updateMembershipRole", () => {
  it("changes another member's role within the owner's company", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("VIEWER"));
    mocks.membership.update.mockResolvedValue({ id: "membership-1", role: "PROJECT_MEMBER" });

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "PROJECT_MEMBER", "company-1"),
    ).resolves.toEqual({ id: "membership-1", role: "PROJECT_MEMBER" });

    expect(mocks.membership.update).toHaveBeenCalledWith({
      where: { id: "membership-1" },
      data: { role: "PROJECT_MEMBER" },
    });
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "membership.role_changed",
        fromState: "VIEWER",
        toState: "PROJECT_MEMBER",
      }),
    });
  });

  it("lets a company owner grant administrator access", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("VIEWER"));
    mocks.membership.update.mockResolvedValue({ id: "membership-1", role: "ADMINISTRATOR" });

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "ADMINISTRATOR", "company-1"),
    ).resolves.toEqual({ id: "membership-1", role: "ADMINISTRATOR" });
    expect(mocks.membership.update).toHaveBeenCalled();
  });

  it("is a no-op when ownership is untouched", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("OWNER"));

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "OWNER", "company-1"),
    ).resolves.toEqual(membership("OWNER"));
    expect(mocks.membership.update).not.toHaveBeenCalled();
  });

  it("rejects non-owners granting administrator access", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("VIEWER"));

    await expect(
      updateMembershipRole(
        principal("administrator"),
        "membership-1",
        "ADMINISTRATOR",
        "company-1",
      ),
    ).rejects.toThrow("Only a company owner can grant administrator access.");
  });

  it("rejects ownership grants entirely", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("VIEWER"));

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "OWNER", "company-1"),
    ).rejects.toThrow("Ownership cannot be granted from user management.");
  });

  it("blocks cross-company membership changes", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(
      membership("VIEWER", { companyId: "company-9" }),
    );

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "PROJECT_MEMBER", "company-1"),
    ).rejects.toThrow("Cross-company access is denied.");
  });

  it("blocks a user from changing their own role", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(
      membership("VIEWER", { userId: "user-1" }),
    );

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "PROJECT_MEMBER", "company-1"),
    ).rejects.toThrow("You cannot change your own role.");
  });

  it("blocks demoting the current owner", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("OWNER"));

    await expect(
      updateMembershipRole(principal("owner"), "membership-1", "PROJECT_MEMBER", "company-1"),
    ).rejects.toThrow("Ownership transfer is not available from user management.");
  });

  it("lets an SDK administrator update any company's membership", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("VIEWER"));
    mocks.membership.update.mockResolvedValue({ id: "membership-1", role: "VIEWER" });

    await expect(
      updateMembershipRole(principal("sdk-admin"), "membership-1", "VIEWER", "company-1"),
    ).resolves.toBeDefined();
    expect(mocks.membership.update).toHaveBeenCalled();
  });

  it("rejects principals without the membership update permission", async () => {
    await expect(
      updateMembershipRole(principal("member"), "membership-1", "VIEWER", "company-1"),
    ).rejects.toThrow("Missing permission: membership:update");
    expect(mocks.membership.findUniqueOrThrow).not.toHaveBeenCalled();
  });
});

describe("removeMembership", () => {
  it("removes another member from the owner's company", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("VIEWER"));
    mocks.membership.count.mockResolvedValue(0);
    mocks.membership.delete.mockResolvedValue({ id: "membership-1" });

    await expect(
      removeMembership(principal("owner"), "membership-1", "company-1"),
    ).resolves.toMatchObject({
      removed: { id: "membership-1" },
      hasNoMemberships: true,
    });
    expect(mocks.membership.delete).toHaveBeenCalledWith({ where: { id: "membership-1" } });
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "membership.removed",
        fromState: "VIEWER",
      }),
    });
  });

  it("rejects removing your own access", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(
      membership("VIEWER", { userId: "user-1" }),
    );

    await expect(removeMembership(principal("owner"), "membership-1", "company-1")).rejects.toThrow(
      "You cannot remove your own access.",
    );
  });

  it("blocks cross-company removals", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(
      membership("VIEWER", { companyId: "company-9" }),
    );

    await expect(removeMembership(principal("owner"), "membership-1", "company-1")).rejects.toThrow(
      "Cross-company access is denied.",
    );
  });

  it("keeps the last company owner in place", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("OWNER"));
    mocks.membership.count.mockResolvedValue(1);

    await expect(removeMembership(principal("owner"), "membership-1", "company-1")).rejects.toThrow(
      "The last company owner cannot be removed.",
    );
    expect(mocks.membership.delete).not.toHaveBeenCalled();
  });

  it("allows removing an owner when another remains", async () => {
    mocks.membership.findUniqueOrThrow.mockResolvedValue(membership("OWNER"));
    mocks.membership.count.mockResolvedValue(2);
    mocks.membership.delete.mockResolvedValue({ id: "membership-1" });

    await expect(
      removeMembership(principal("owner"), "membership-1", "company-1"),
    ).resolves.toBeDefined();
    expect(mocks.membership.count).toHaveBeenCalledWith({
      where: { companyId: "company-1", role: "OWNER" },
    });
  });

  it("rejects principals without the membership remove permission", async () => {
    await expect(
      removeMembership(principal("member"), "membership-1", "company-1"),
    ).rejects.toThrow("Missing permission: membership:remove");
  });
});
