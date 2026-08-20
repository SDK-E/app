import { describe, expect, it } from "vitest";
import { canViewOpportunity } from "@/lib/opportunities/safe";
import { principal } from "@/lib/users/test-fixtures";
import type { AppPrincipal } from "@/types";

const MODES = ["DIRECT", "INVITE_ONLY", "ELIGIBLE_NETWORK"] as const;

function finance(): AppPrincipal {
  return { ...principal("sdk-admin"), kind: "sdk-staff", role: "FINANCE" } as AppPrincipal;
}

describe("canViewOpportunity — visibility authorization matrix", () => {
  it("privileged SDK staff (ADMIN/DELIVERY) can view every visibility mode", () => {
    for (const mode of MODES) {
      expect(canViewOpportunity(principal("sdk-admin"), mode)).toBe(true);
      expect(canViewOpportunity(principal("delivery"), mode)).toBe(true);
    }
  });

  it("FINANCE staff cannot view opportunities", () => {
    for (const mode of MODES) {
      expect(canViewOpportunity(finance(), mode)).toBe(false);
    }
  });

  it("providers can only view ELIGIBLE_NETWORK opportunities", () => {
    expect(canViewOpportunity(principal("provider"), "ELIGIBLE_NETWORK")).toBe(true);
    expect(canViewOpportunity(principal("provider"), "INVITE_ONLY")).toBe(false);
    expect(canViewOpportunity(principal("provider"), "DIRECT")).toBe(false);
  });

  it("clients can only view ELIGIBLE_NETWORK opportunities", () => {
    expect(canViewOpportunity(principal("owner"), "ELIGIBLE_NETWORK")).toBe(true);
    expect(canViewOpportunity(principal("owner"), "INVITE_ONLY")).toBe(false);
    expect(canViewOpportunity(principal("owner"), "DIRECT")).toBe(false);
  });

  it("unassigned principals cannot view any opportunity", () => {
    for (const mode of MODES) {
      expect(canViewOpportunity(principal("unassigned"), mode)).toBe(false);
    }
  });
});
