import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  setVisibilityMode,
  transitionOpportunityStatus,
} from "@sdk-e/opportunities/workflow/status";
import { addPosition } from "@sdk-e/opportunities/workflow/positions";
import { addInternalNote } from "@sdk-e/opportunities/workflow/notes";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const make = () => ({ create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() });
  const opportunity = make();
  const opportunityPosition = make();
  const opportunityActivity = make();
  const document = make();
  const company = make();
  const auditEvent = make();
  return {
    prisma: {
      opportunity,
      opportunityPosition,
      opportunityActivity,
      document,
      company,
      auditEvent,
      $transaction: vi.fn(),
    },
    opportunity,
    opportunityPosition,
    opportunityActivity,
    document,
    company,
    auditEvent,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

beforeEach(() => {
  for (const mock of [
    mocks.opportunity,
    mocks.opportunityPosition,
    mocks.opportunityActivity,
    mocks.document,
    mocks.company,
    mocks.auditEvent,
  ]) {
    mock.create?.mockReset();
    mock.findFirst?.mockReset();
    mock.update?.mockReset();
    mock.delete?.mockReset();
  }
});

describe("transitionOpportunityStatus", () => {
  it("succeeds for a valid transition and logs it", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({ id: "opp-1", status: "DRAFT" });
    mocks.opportunity.update.mockResolvedValue({ id: "opp-1", status: "READY" });
    mocks.opportunityActivity.create.mockResolvedValue({ id: "act-1" });

    await transitionOpportunityStatus(principal("sdk-admin"), "company-1", "opp-1", "READY");

    expect(mocks.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-1" },
      data: { status: "READY" },
    });
    expect(mocks.opportunityActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "STATUS_CHANGED",
        fromStatus: "DRAFT",
        toStatus: "READY",
      }),
    });
  });

  it("throws for an invalid transition", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({ id: "opp-1", status: "DRAFT" });

    await expect(
      transitionOpportunityStatus(principal("sdk-admin"), "company-1", "opp-1", "OPEN")
    ).rejects.toThrow("Invalid state transition from DRAFT to OPEN");
    expect(mocks.opportunity.update).not.toHaveBeenCalled();
  });

  it("throws when the opportunity does not exist", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue(null);

    await expect(
      transitionOpportunityStatus(principal("sdk-admin"), "company-1", "opp-1", "READY")
    ).rejects.toThrow("Opportunity not found.");
  });
});

describe("setVisibilityMode", () => {
  it("updates visibility mode and logs the change", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({ id: "opp-1", visibilityMode: "INVITE_ONLY" });
    mocks.opportunity.update.mockResolvedValue({ id: "opp-1", visibilityMode: "ELIGIBLE_NETWORK" });
    mocks.opportunityActivity.create.mockResolvedValue({ id: "act-1" });

    await setVisibilityMode(principal("delivery"), "company-1", "opp-1", "ELIGIBLE_NETWORK");

    expect(mocks.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-1" },
      data: { visibilityMode: "ELIGIBLE_NETWORK" },
    });
    expect(mocks.opportunityActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "VISIBILITY_CHANGED",
        fromVisibility: "INVITE_ONLY",
        toVisibility: "ELIGIBLE_NETWORK",
      }),
    });
  });

  it.each(["DIRECT", "INVITE_ONLY", "ELIGIBLE_NETWORK"] as const)(
    "accepts visibility mode %s",
    async (mode) => {
      mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
      mocks.opportunity.findFirst.mockResolvedValue({ id: "opp-1", visibilityMode: "INVITE_ONLY" });
      mocks.opportunity.update.mockResolvedValue({ id: "opp-1", visibilityMode: mode });
      mocks.opportunityActivity.create.mockResolvedValue({ id: "act-1" });

      await setVisibilityMode(principal("sdk-admin"), "company-1", "opp-1", mode);

      expect(mocks.opportunity.update).toHaveBeenCalledWith({
        where: { id: "opp-1" },
        data: { visibilityMode: mode },
      });
      expect(mocks.opportunityActivity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: "VISIBILITY_CHANGED",
          toVisibility: mode,
        }),
      });
    }
  );

  it("rejects setting visibility mode for non-SDK staff", async () => {
    await expect(
      setVisibilityMode(principal("provider"), "company-1", "opp-1", "ELIGIBLE_NETWORK")
    ).rejects.toThrow("SDK staff access is required.");
    expect(mocks.opportunity.update).not.toHaveBeenCalled();
  });
});

describe("addInternalNote", () => {
  it("appends to existing notes", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({ id: "opp-1", internalNotes: "first" });
    mocks.opportunity.update.mockResolvedValue({ id: "opp-1", internalNotes: "first\nsecond" });
    mocks.opportunityActivity.create.mockResolvedValue({ id: "act-1" });

    await addInternalNote(principal("sdk-admin"), "company-1", "opp-1", "second");

    expect(mocks.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-1" },
      data: { internalNotes: "first\nsecond" },
    });
    expect(mocks.opportunityActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "NOTE_ADDED" }),
    });
  });
});

describe("addPosition", () => {
  it("creates a position with the inherited companyId", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({ id: "opp-1" });
    mocks.opportunityPosition.create.mockResolvedValue({ id: "pos-1" });
    mocks.opportunityActivity.create.mockResolvedValue({ id: "act-1" });

    await addPosition(principal("sdk-admin"), "company-1", "opp-1", {
      title: "Senior Engineer",
      description: "Build features",
    });

    expect(mocks.opportunityPosition.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        opportunityId: "opp-1",
        companyId: "company-1",
        title: "Senior Engineer",
        description: "Build features",
        currency: "USD",
        providerCount: 1,
      }),
    });
    expect(mocks.opportunityActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "POSITION_ADDED" }),
    });
  });
});
