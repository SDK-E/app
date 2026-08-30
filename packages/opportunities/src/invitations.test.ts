import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  acceptOpportunityInvitation,
  createOpportunityInvitation,
  declineOpportunityInvitation,
  expireOpportunityInvitations,
} from "@sdk-e/opportunities/invitations";
import { principal } from "@sdk-e/test-support/test-fixtures";

const prisma = vi.hoisted(() => ({
  opportunity: { findFirst: vi.fn() },
  provider: { findFirst: vi.fn() },
  opportunityInvitation: {
    findFirst: vi.fn(),
    create: vi.fn(async (args) => ({ id: "inv-1", ...args.data })),
    update: vi.fn(async (args) => ({ id: args.where.id, ...args.data })),
    updateMany: vi.fn(async () => ({ count: 1 })),
    findMany: vi.fn(),
  },
  notification: { create: vi.fn(async (args) => ({ id: "notif-1", ...args.data })) },
  notificationDelivery: {
    create: vi.fn(),
    update: vi.fn(),
    findFirstOrThrow: vi.fn(),
  },
}));

vi.mock("@sdk-e/db", () => ({ getPrisma: () => prisma }));
vi.mock("@sdk-e/notifications/delivery", () => ({
  deliver: vi.fn(async () => ({ inApp: {}, email: true })),
}));

const opportunity = { id: "opp-1", companyId: "company-1", title: "Build a dashboard" };
const providerWithUser = {
  id: "provider-1",
  user: { id: "user-1", email: "provider@example.test", name: "Provider" },
};

describe("createOpportunityInvitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.opportunity.findFirst.mockResolvedValue(opportunity);
    prisma.opportunityInvitation.findFirst.mockResolvedValue(null);
    prisma.provider.findFirst.mockResolvedValue(providerWithUser);
  });

  it("creates a PENDING invitation and schedules expiry", async () => {
    const before = Date.now();
    const invitation = await createOpportunityInvitation(
      principal("sdk-admin"),
      "opp-1",
      "provider-1",
      14
    );
    expect(invitation.status).toBe("PENDING");
    expect(invitation.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 14 * 86_400_000 - 1000);
    expect(invitation.expiresAt.getTime()).toBeLessThanOrEqual(before + 14 * 86_400_000 + 1000);
  });

  it("defaults the TTL to 7 days", async () => {
    const before = Date.now();
    const invitation = await createOpportunityInvitation(
      principal("sdk-admin"),
      "opp-1",
      "provider-1"
    );
    expect(invitation.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 7 * 86_400_000 - 1000);
  });

  it("fails fast when the provider has no user account", async () => {
    prisma.provider.findFirst.mockResolvedValue({ id: "provider-1", user: null });
    await expect(
      createOpportunityInvitation(principal("sdk-admin"), "opp-1", "provider-1")
    ).rejects.toThrow("no associated user");
    expect(prisma.opportunityInvitation.create).not.toHaveBeenCalled();
  });

  it("reuses an existing active invitation instead of duplicating", async () => {
    prisma.opportunityInvitation.findFirst.mockResolvedValueOnce({
      id: "inv-existing",
      status: "PENDING",
    });
    const invitation = await createOpportunityInvitation(
      principal("sdk-admin"),
      "opp-1",
      "provider-1"
    );
    expect(invitation.id).toBe("inv-existing");
    expect(prisma.opportunityInvitation.create).not.toHaveBeenCalled();
  });
});

describe("acceptOpportunityInvitation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts a pending invitation", async () => {
    prisma.opportunityInvitation.findFirst.mockResolvedValue({
      id: "inv-1",
      providerId: "provider-1",
      status: "PENDING",
      opportunity: { id: "opp-1", title: "Build a dashboard" },
    });
    const updated = await acceptOpportunityInvitation(principal("provider"), "inv-1");
    expect(updated.status).toBe("ACCEPTED");
    expect(updated.acceptedAt).toBeInstanceOf(Date);
    expect(updated.respondedAt).toBeInstanceOf(Date);
  });

  it("rejects accepting an already-accepted invitation", async () => {
    prisma.opportunityInvitation.findFirst.mockResolvedValue({
      id: "inv-1",
      providerId: "provider-1",
      status: "ACCEPTED",
      opportunity: { id: "opp-1", title: "Build a dashboard" },
    });
    await expect(acceptOpportunityInvitation(principal("provider"), "inv-1")).rejects.toThrow(
      "already accepted"
    );
  });
});

describe("declineOpportunityInvitation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("declines a pending invitation", async () => {
    prisma.opportunityInvitation.findFirst.mockResolvedValue({
      id: "inv-1",
      providerId: "provider-1",
      status: "PENDING",
      opportunity: { id: "opp-1", title: "Build a dashboard" },
    });
    const updated = await declineOpportunityInvitation(principal("provider"), "inv-1");
    expect(updated.status).toBe("DECLINED");
    expect(updated.respondedAt).toBeInstanceOf(Date);
  });

  it("rejects declining an expired invitation", async () => {
    prisma.opportunityInvitation.findFirst.mockResolvedValue({
      id: "inv-1",
      providerId: "provider-1",
      status: "EXPIRED",
      opportunity: { id: "opp-1", title: "Build a dashboard" },
    });
    await expect(declineOpportunityInvitation(principal("provider"), "inv-1")).rejects.toThrow(
      "already expired"
    );
  });
});

describe("expireOpportunityInvitations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("transitions expired PENDING invitations to EXPIRED", async () => {
    prisma.opportunityInvitation.findMany.mockResolvedValue([
      {
        id: "inv-1",
        providerId: "provider-1",
        opportunity: { id: "opp-1", title: "Old" },
        provider: { user: { id: "user-1", email: "provider@example.test", name: "Provider" } },
      },
    ]);
    const count = await expireOpportunityInvitations();
    expect(count).toBe(1);
    expect(prisma.opportunityInvitation.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["inv-1"] }, status: "PENDING" },
      data: { status: "EXPIRED" },
    });
  });
});
