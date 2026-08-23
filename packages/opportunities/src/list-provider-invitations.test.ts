import { beforeEach, describe, expect, it, vi } from "vitest";

import { listProviderInvitations } from "@sdk-e/opportunities/invitations";
import { principal } from "@sdk-e/test-support/test-fixtures";

const prisma = vi.hoisted(() => ({
  opportunity: { findFirst: vi.fn() },
  provider: { findFirst: vi.fn() },
  opportunityInvitation: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("@sdk-e/db", () => ({ getPrisma: () => prisma }));

describe("listProviderInvitations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns only the provider's invitations with provider-safe opportunities", async () => {
    prisma.opportunityInvitation.findMany.mockResolvedValue([
      {
        id: "inv-1",
        providerId: "provider-1",
        status: "PENDING",
        opportunity: {
          id: "opp-1",
          title: "Build a dashboard",
          internalNotes: "SDK-only context",
          rejectionFeedback: "Not for providers",
          ownerId: "owner-1",
          clientName: "Acme",
          budgetMin: "1000",
          budgetMax: "5000",
        },
      },
    ]);

    const invitations = await listProviderInvitations(principal("provider"));

    expect(invitations).toHaveLength(1);
    expect(invitations[0].id).toBe("inv-1");
    expect(invitations[0].opportunity.title).toBe("Build a dashboard");
    expect(invitations[0].opportunity).not.toHaveProperty("internalNotes");
    expect(invitations[0].opportunity).not.toHaveProperty("rejectionFeedback");
    expect(invitations[0].opportunity).not.toHaveProperty("ownerId");
    expect(invitations[0].opportunity).not.toHaveProperty("budgetMin");
    expect(invitations[0].opportunity).not.toHaveProperty("budgetMax");
  });

  it("scopes results to the calling provider", async () => {
    prisma.opportunityInvitation.findMany.mockResolvedValue([]);
    const invitations = await listProviderInvitations(principal("provider"));
    expect(invitations).toEqual([]);
    expect(prisma.opportunityInvitation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { providerId: "provider-1" } })
    );
  });
});
