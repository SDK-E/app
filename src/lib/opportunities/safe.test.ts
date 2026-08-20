import { describe, expect, it } from "vitest";
import { selectOpportunitySafe, selectOpportunityPositionSafe } from "@/lib/opportunities/safe";
import { principal } from "@/lib/users/test-fixtures";
import { Prisma } from "@/generated/prisma/client";
import type { Opportunity, OpportunityPosition } from "@/generated/prisma/client";

const SENSITIVE_OPPORTUNITY: Opportunity = {
  id: "opp-1",
  companyId: "company-1",
  requestId: null,
  title: "Build platform",
  description: "Build a platform",
  clientName: "Acme Corp",
  ndaRequired: true,
  clientIdentityVisible: false,
  requiredSkills: ["typescript"],
  preferredSkills: ["react"],
  seniority: "SENIOR",
  engagementType: "HOURLY",
  budgetMin: new Prisma.Decimal(1000),
  budgetMax: null,
  currency: "USD",
  duration: "3 months",
  startDate: new Date("2026-03-01"),
  deadline: null,
  locationTimezone: "Europe/Berlin",
  languages: ["en"],
  deliverables: "Working app",
  providerCount: 2,
  internalNotes: "Confidential negotiation notes",
  rejectionFeedback: "Please refine scope",
  ownerId: "user-9",
  status: "DRAFT",
  visibilityMode: "INVITE_ONLY",
  createdBy: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
} as unknown as Opportunity;

const SENSITIVE_POSITION: OpportunityPosition = {
  id: "pos-1",
  opportunityId: "opp-1",
  companyId: "company-1",
  title: "Senior Engineer",
  description: "Build features",
  requiredSkills: ["go"],
  preferredSkills: [],
  seniority: "SENIOR",
  engagementType: "HOURLY",
  budgetMin: null,
  budgetMax: null,
  currency: "USD",
  duration: "3 months",
  startDate: null,
  deadline: null,
  locationTimezone: null,
  languages: ["en"],
  deliverables: null,
  providerCount: 1,
  internalNotes: "Position hiring notes",
  sortOrder: 0,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
} as unknown as OpportunityPosition;

describe("selectOpportunitySafe — field-level access control", () => {
  const SENSITIVE_FIELDS = ["internalNotes", "rejectionFeedback", "ownerId"] as const;

  it("ADMIN sees all sensitive fields", () => {
    const result = selectOpportunitySafe(principal("sdk-admin"), SENSITIVE_OPPORTUNITY);
    for (const field of SENSITIVE_FIELDS) {
      expect(result).toHaveProperty(field);
    }
    expect((result as Opportunity).internalNotes).toBe("Confidential negotiation notes");
  });

  it("DELIVERY sees all sensitive fields", () => {
    const result = selectOpportunitySafe(principal("delivery"), SENSITIVE_OPPORTUNITY);
    for (const field of SENSITIVE_FIELDS) {
      expect(result).toHaveProperty(field);
    }
  });

  it("FINANCE does not see internalNotes or rejectionFeedback", () => {
    const finance = {
      ...principal("sdk-admin"),
      kind: "sdk-staff" as const,
      role: "FINANCE" as const,
    };
    const result = selectOpportunitySafe(finance, SENSITIVE_OPPORTUNITY);
    expect(result).not.toHaveProperty("internalNotes");
    expect(result).not.toHaveProperty("rejectionFeedback");
    expect(result).not.toHaveProperty("ownerId");
  });

  it("client does not see internalNotes, rejectionFeedback, or ownerId", () => {
    const result = selectOpportunitySafe(principal("owner"), SENSITIVE_OPPORTUNITY);
    expect(result).not.toHaveProperty("internalNotes");
    expect(result).not.toHaveProperty("rejectionFeedback");
    expect(result).not.toHaveProperty("ownerId");
    expect(result).toHaveProperty("clientName");
    expect(result).toHaveProperty("budgetMin");
  });

  it("provider does not see internalNotes, rejectionFeedback, ownerId, clientName, or budget", () => {
    const result = selectOpportunitySafe(principal("provider"), SENSITIVE_OPPORTUNITY);
    expect(result).not.toHaveProperty("internalNotes");
    expect(result).not.toHaveProperty("rejectionFeedback");
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("clientName");
    expect(result).not.toHaveProperty("budgetMin");
    expect(result).not.toHaveProperty("budgetMax");
  });

  it("provider sees clientName when clientIdentityVisible is true", () => {
    const visible = { ...SENSITIVE_OPPORTUNITY, clientIdentityVisible: true } as Opportunity;
    const result = selectOpportunitySafe(principal("provider"), visible);
    expect(result).toHaveProperty("clientName");
    expect((result as Record<string, unknown>).clientName).toBe("Acme Corp");
  });

  it("all roles see base fields", () => {
    const roles = [
      principal("provider"),
      principal("sdk-admin"),
      principal("delivery"),
      { ...principal("sdk-admin"), kind: "sdk-staff" as const, role: "FINANCE" as const },
      principal("owner"),
    ];
    for (const p of roles) {
      const result = selectOpportunitySafe(p, SENSITIVE_OPPORTUNITY);
      expect(result.id).toBe("opp-1");
      expect(result.title).toBe("Build platform");
      expect(result.status).toBe("DRAFT");
    }
  });
});

describe("selectOpportunityPositionSafe — field-level access control", () => {
  it("ADMIN sees internalNotes on positions", () => {
    const result = selectOpportunityPositionSafe(principal("sdk-admin"), SENSITIVE_POSITION);
    expect(result).toHaveProperty("internalNotes");
  });

  it("provider does not see internalNotes or budget", () => {
    const result = selectOpportunityPositionSafe(principal("provider"), SENSITIVE_POSITION);
    expect(result).not.toHaveProperty("internalNotes");
    expect(result).not.toHaveProperty("budgetMin");
    expect(result).not.toHaveProperty("budgetMax");
  });

  it("client does not see internalNotes", () => {
    const result = selectOpportunityPositionSafe(principal("owner"), SENSITIVE_POSITION);
    expect(result).not.toHaveProperty("internalNotes");
  });
});
