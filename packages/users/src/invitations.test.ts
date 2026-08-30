import { principal } from "@platform/test-support/test-fixtures";
import {
  createClientInvitation,
  createStaffInvitation,
  markInvitationDelivery,
  renewInvitation,
  restoreInvitationDelivery,
} from "@platform/users";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findFirst: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  });
  const invitation = make();
  const user = make();
  const company = make();
  const auditEvent = { create: vi.fn().mockResolvedValue({ id: "audit-1" }) };
  const prisma = { invitation, user, company, auditEvent };
  return { prisma, invitation, user, company, auditEvent };
});

vi.mock("@platform/db", () => ({
  getPrisma: () => mocks.prisma,
}));

const now = new Date("2026-08-17T00:00:00.000Z");
const later = new Date("2026-08-24T00:00:00.000Z");
const clientInvite = {
  id: "inv-1",
  tokenHash: "old-hash",
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

describe("createClientInvitation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("rejects an email that is already a member of the company", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.user.findFirst.mockResolvedValue({
      id: "user-9",
      sdkStaffRole: null,
      memberships: [{ id: "m1" }],
    });

    await expect(
      createClientInvitation(
        principal("owner"),
        { email: "taken@example.com", role: "PROJECT_MEMBER" },
        "company-1",
      ),
    ).rejects.toThrow("already a member of this company");
    expect(mocks.invitation.create).not.toHaveBeenCalled();
  });

  it("rejects a duplicate pending invitation for the same email", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.user.findFirst.mockResolvedValue(null);
    mocks.invitation.findFirst.mockResolvedValue({ id: "inv-9" });

    await expect(
      createClientInvitation(
        principal("owner"),
        { email: "new.user@example.com", role: "PROJECT_MEMBER" },
        "company-1",
      ),
    ).rejects.toThrow("already pending");
    expect(mocks.invitation.create).not.toHaveBeenCalled();
  });

  it("records an audit event when a client invitation is created", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.user.findFirst.mockResolvedValue(null);
    mocks.invitation.findFirst.mockResolvedValue(null);
    mocks.invitation.create.mockResolvedValue({ id: "inv-new" });

    await createClientInvitation(
      principal("owner"),
      { email: "new.user@example.com", role: "PROJECT_MEMBER" },
      "company-1",
    );

    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "invitation.created",
        companyId: "company-1",
        targetId: "inv-new",
        toState: "PROJECT_MEMBER",
      }),
    });
  });
});

describe("createStaffInvitation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

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
      }),
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
      }),
    ).rejects.toThrow("already pending");
    expect(mocks.invitation.create).not.toHaveBeenCalled();
  });
});

describe("delivery bookkeeping", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

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
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renewInvitation returns the previous token state for a failed delivery", async () => {
    const pending = { ...clientInvite };
    mocks.invitation.findUniqueOrThrow.mockResolvedValue(pending);
    mocks.invitation.update.mockImplementation(async ({ data }) => ({ ...pending, ...data }));

    const result = await renewInvitation(principal("sdk-admin"), "inv-1");

    expect(result.previousTokenHash).toBe("old-hash");
    expect(result.previousExpiresAt).toBe(later);
    expect(result.token).not.toBe("old-hash");
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "invitation.renewed", targetId: "inv-1" }),
    });
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
