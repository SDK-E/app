import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthorizationError } from "@/lib/authorization";
import {
  acceptInvitation,
  canManageUsers,
  createClientInvitation,
  createStaffInvitation,
  hashInvitationToken,
  markInvitationDelivery,
  renewInvitation,
  restoreInvitationDelivery,
} from "@/lib/user-management";
import type { AppPrincipal } from "@/types";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  });
  const invitation = make();
  const user = make();
  const membership = make();
  const company = make();
  const companyAccessRequest = make();
  const prisma = {
    $transaction: vi.fn(),
    invitation,
    user,
    membership,
    company,
    companyAccessRequest,
  };
  return { prisma, invitation, user, membership, company, companyAccessRequest };
});

vi.mock("@/lib/db", () => ({
  getPrisma: () => mocks.prisma,
}));

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

describe("user management policies", () => {
  it.each([
    ["owner", true],
    ["administrator", true],
    ["member", false],
    ["sdk-admin", true],
    ["delivery", false],
    ["unassigned", false],
  ] as const)("exposes management only to authorized %s principals", (kind, expected) => {
    expect(canManageUsers(principal(kind))).toBe(expected);
  });

  it("hashes invitation tokens deterministically without retaining the raw token", () => {
    const raw = "single-use-secret";
    const hash = hashInvitationToken(raw);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(raw);
    expect(hashInvitationToken(raw)).toBe(hash);
    expect(hashInvitationToken(`${raw}-other`)).not.toBe(hash);
  });
});

const now = new Date("2026-08-17T00:00:00.000Z");
const later = new Date("2026-08-24T00:00:00.000Z");
const clientInvite = {
  id: "inv-1",
  tokenHash: "abc123",
  email: "new.user@example.com",
  kind: "CLIENT" as const,
  companyId: "company-1",
  clientRole: "PROJECT_MEMBER" as const,
  sdkStaffRole: null,
  invitedBy: "user-1",
  expiresAt: later,
  acceptedAt: null,
  acceptedBy: null,
  revokedAt: null,
  deliveryStatus: "PENDING" as const,
  lastSentAt: null,
  createdAt: now,
  updatedAt: now,
};

describe("invitation lifecycle", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
  });

  describe("acceptInvitation", () => {
    const input = {
      token: "raw-token",
      userId: "user-1",
      email: "new.user@example.com",
    };
    const unassignedUser = { id: "user-1", sdkStaffRole: null, memberships: [] };

    it("accepts a client invitation after revalidating the company is active", async () => {
      mocks.invitation.findUnique.mockResolvedValueOnce(clientInvite).mockResolvedValueOnce({
        ...clientInvite,
        acceptedAt: new Date(),
        acceptedBy: "user-1",
        company: { name: "Company" },
      });
      mocks.user.findUniqueOrThrow.mockResolvedValue(unassignedUser);
      mocks.user.findMany.mockResolvedValue([{ id: "user-1" }]);
      mocks.invitation.updateMany.mockResolvedValue({ count: 1 });
      mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
      mocks.membership.create.mockResolvedValue({ id: "m-1" });

      const result = await acceptInvitation(input);

      expect(mocks.company.findFirst).toHaveBeenCalledWith({
        where: { id: "company-1", isActive: true },
        select: { id: true },
      });
      expect(mocks.membership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            companyId: "company-1",
            role: "PROJECT_MEMBER",
          }),
        })
      );
      expect(result).toMatchObject({ id: "inv-1", acceptedBy: "user-1" });
    });

    it("matches the invitation email case-insensitively", async () => {
      mocks.invitation.findUnique
        .mockResolvedValueOnce(clientInvite)
        .mockResolvedValueOnce({ ...clientInvite, acceptedAt: new Date(), acceptedBy: "user-1" });
      mocks.user.findUniqueOrThrow.mockResolvedValue(unassignedUser);
      mocks.user.findMany.mockResolvedValue([{ id: "user-1" }]);
      mocks.invitation.updateMany.mockResolvedValue({ count: 1 });
      mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
      mocks.membership.create.mockResolvedValue({ id: "m-1" });

      await acceptInvitation({ ...input, email: "NEW.USER@Example.COM" });

      expect(mocks.invitation.updateMany).toHaveBeenCalled();
    });

    it("rejects an invitation whose email maps to more than one account", async () => {
      mocks.invitation.findUnique.mockResolvedValue(clientInvite);
      mocks.user.findUniqueOrThrow.mockResolvedValue(unassignedUser);
      mocks.user.findMany.mockResolvedValue([{ id: "user-1" }, { id: "user-2" }]);

      await expect(acceptInvitation(input)).rejects.toThrow("linked to more than one account");
      expect(mocks.invitation.updateMany).not.toHaveBeenCalled();
      expect(mocks.membership.create).not.toHaveBeenCalled();
    });

    it("rejects accepting an invitation into an inactive company", async () => {
      mocks.invitation.findUnique.mockResolvedValue(clientInvite);
      mocks.user.findUniqueOrThrow.mockResolvedValue(unassignedUser);
      mocks.user.findMany.mockResolvedValue([{ id: "user-1" }]);
      mocks.invitation.updateMany.mockResolvedValue({ count: 1 });
      mocks.company.findFirst.mockResolvedValue(null);

      await expect(acceptInvitation(input)).rejects.toThrow("The company is no longer active.");
      expect(mocks.membership.create).not.toHaveBeenCalled();
    });

    it("rejects a second concurrent acceptance via the claim-first guard", async () => {
      mocks.invitation.findUnique.mockResolvedValue(clientInvite);
      mocks.user.findUniqueOrThrow.mockResolvedValue(unassignedUser);
      mocks.user.findMany.mockResolvedValue([{ id: "user-1" }]);
      mocks.invitation.updateMany.mockResolvedValue({ count: 0 });

      const promise = acceptInvitation(input);

      await expect(promise).rejects.toBeInstanceOf(AuthorizationError);
      await expect(promise).rejects.toThrow("This invitation has already been used.");
      expect(mocks.membership.create).not.toHaveBeenCalled();
    });
  });

  describe("createClientInvitation", () => {
    it("rejects an email that already has an account with application access", async () => {
      mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
      mocks.user.findFirst.mockResolvedValue({ id: "user-9" });

      await expect(
        createClientInvitation(principal("owner"), {
          email: "taken@example.com",
          role: "PROJECT_MEMBER",
        })
      ).rejects.toThrow("already has an account with application access");
      expect(mocks.invitation.create).not.toHaveBeenCalled();
    });

    it("rejects a duplicate pending invitation for the same email", async () => {
      mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
      mocks.user.findFirst.mockResolvedValue(null);
      mocks.invitation.findFirst.mockResolvedValue({ id: "inv-9" });

      await expect(
        createClientInvitation(principal("owner"), {
          email: "new.user@example.com",
          role: "PROJECT_MEMBER",
        })
      ).rejects.toThrow("already pending");
      expect(mocks.invitation.create).not.toHaveBeenCalled();
    });
  });

  describe("createStaffInvitation", () => {
    it("rejects an email that already has an assignment", async () => {
      mocks.user.findFirst.mockResolvedValue({
        id: "user-9",
        sdkStaffRole: "ADMIN",
        memberships: [],
      });

      await expect(
        createStaffInvitation(principal("sdk-admin"), {
          email: "staff@example.com",
          role: "DELIVERY",
        })
      ).rejects.toThrow("already has an account with application access");
      expect(mocks.invitation.create).not.toHaveBeenCalled();
    });

    it("rejects a duplicate pending staff invitation", async () => {
      mocks.user.findFirst.mockResolvedValue({ id: "user-9", sdkStaffRole: null, memberships: [] });
      mocks.invitation.findFirst.mockResolvedValue({ id: "inv-9" });

      await expect(
        createStaffInvitation(principal("sdk-admin"), {
          email: "staff@example.com",
          role: "DELIVERY",
        })
      ).rejects.toThrow("already pending");
      expect(mocks.invitation.create).not.toHaveBeenCalled();
    });
  });

  describe("delivery bookkeeping", () => {
    it("records a successful delivery with an attempt and a sent timestamp", async () => {
      mocks.invitation.update.mockResolvedValue({ id: "inv-1" });

      await markInvitationDelivery("inv-1", true);

      expect(mocks.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: expect.objectContaining({
          deliveryStatus: "SENT",
          lastSentAt: expect.any(Date),
          deliveryAttempts: { increment: 1 },
        }),
      });
    });

    it("never downgrades an already-sent invitation to FAILED", async () => {
      mocks.invitation.updateMany.mockResolvedValue({ count: 0 });

      await markInvitationDelivery("inv-1", false);

      expect(mocks.invitation.updateMany).toHaveBeenCalledWith({
        where: { id: "inv-1", deliveryStatus: { not: "SENT" } },
        data: { deliveryStatus: "FAILED", deliveryAttempts: { increment: 1 } },
      });
      expect(mocks.invitation.update).not.toHaveBeenCalled();
    });
  });

  describe("resend rollback", () => {
    it("renewInvitation returns the previous token state for a failed delivery", async () => {
      const pending = { ...clientInvite, tokenHash: "old-hash" };
      mocks.invitation.findUniqueOrThrow.mockResolvedValue(pending);
      mocks.invitation.update.mockImplementation(async ({ data }) => ({ ...pending, ...data }));

      const result = await renewInvitation(principal("sdk-admin"), "inv-1");

      expect(result.previousTokenHash).toBe("old-hash");
      expect(result.previousExpiresAt).toBe(later);
      expect(result.token).not.toBe("old-hash");
    });

    it("restoreInvitationDelivery writes back the previous token and expiry", async () => {
      mocks.invitation.update.mockResolvedValue({ id: "inv-1" });

      await restoreInvitationDelivery("inv-1", { tokenHash: "old-hash", expiresAt: later });

      expect(mocks.invitation.update).toHaveBeenCalledWith({
        where: { id: "inv-1" },
        data: { tokenHash: "old-hash", expiresAt: later, deliveryStatus: "PENDING" },
      });
    });
  });
});
