import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getProviderPreferences,
  hideOpportunity,
  saveOpportunity,
} from "@sdk-e/opportunities/preferences";
import { principal } from "@sdk-e/test-support/test-fixtures";

const prisma = vi.hoisted(() => ({
  provider: { findFirst: vi.fn() },
  opportunityProviderPreference: {
    findFirst: vi.fn(),
    create: vi.fn(async (args) => ({ id: "pref-1", ...args.data })),
    update: vi.fn(async (args) => ({ id: args.where.id, ...args.data })),
    findMany: vi.fn(),
  },
  notification: { create: vi.fn(async (args) => ({ id: "notif-1", ...args.data })) },
}));

vi.mock("@sdk-e/db", () => ({ getPrisma: () => prisma }));
vi.mock("@sdk-e/notifications/delivery", () => ({ deliver: vi.fn() }));

describe("saveOpportunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.provider.findFirst.mockResolvedValue({ id: "provider-1", companyId: "company-1" });
    prisma.opportunityProviderPreference.findFirst.mockResolvedValue(null);
  });

  it("creates a SAVED preference", async () => {
    const preference = await saveOpportunity(principal("provider"), "opp-1");
    expect(preference.action).toBe("SAVED");
    expect(prisma.opportunityProviderPreference.create).toHaveBeenCalledTimes(1);
  });

  it("is idempotent and does not duplicate the preference", async () => {
    await saveOpportunity(principal("provider"), "opp-1");
    prisma.opportunityProviderPreference.findFirst.mockResolvedValue({
      id: "pref-1",
      action: "SAVED",
    });
    const second = await saveOpportunity(principal("provider"), "opp-1");
    expect(second.action).toBe("SAVED");
    expect(prisma.opportunityProviderPreference.create).toHaveBeenCalledTimes(1);
  });
});

describe("hideOpportunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.provider.findFirst.mockResolvedValue({ id: "provider-1", companyId: "company-1" });
  });

  it("overwrites a saved preference with HIDDEN", async () => {
    prisma.opportunityProviderPreference.findFirst.mockResolvedValueOnce({
      id: "pref-1",
      action: "SAVED",
    });
    const preference = await hideOpportunity(principal("provider"), "opp-1");
    expect(preference.action).toBe("HIDDEN");
    expect(prisma.opportunityProviderPreference.update).toHaveBeenCalledWith({
      where: { id: "pref-1" },
      data: { action: "HIDDEN" },
    });
  });

  it("saving after hiding wins (SAVED)", async () => {
    prisma.opportunityProviderPreference.findFirst.mockResolvedValueOnce({
      id: "pref-1",
      action: "HIDDEN",
    });
    await hideOpportunity(principal("provider"), "opp-1");
    prisma.opportunityProviderPreference.findFirst.mockResolvedValueOnce({
      id: "pref-1",
      action: "HIDDEN",
    });
    const preference = await saveOpportunity(principal("provider"), "opp-1");
    expect(preference.action).toBe("SAVED");
  });
});

describe("getProviderPreferences", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns separated saved and hidden opportunities", async () => {
    prisma.opportunityProviderPreference.findMany
      .mockResolvedValueOnce([{ opportunity: { id: "opp-1" } }])
      .mockResolvedValueOnce([{ opportunity: { id: "opp-2" } }]);
    const result = await getProviderPreferences(principal("provider"));
    expect(result.saved).toHaveLength(1);
    expect(result.saved[0].id).toBe("opp-1");
    expect(result.hidden).toHaveLength(1);
    expect(result.hidden[0].id).toBe("opp-2");
  });
});
