import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthorizationError } from "@/lib/auth/authorization";
import { acceptInvitation } from "@/lib/users";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
  });
  const invitation = make();
  const user = make();
  const membership = make();
  const company = make();
  const prisma = { $transaction: vi.fn(), invitation, user, membership, company };
  return { prisma, invitation, user, membership, company };
});

vi.mock("@/lib/db", () => ({
  getPrisma: () => mocks.prisma,
}));

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

const input = {
  token: "raw-token",
  userId: "user-1",
  email: "new.user@example.com",
};
const unassignedUser = { id: "user-1", sdkStaffRole: null, memberships: [] };

describe("acceptInvitation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));
  });

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
