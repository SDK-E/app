import { beforeEach, describe, expect, it, vi } from "vitest";

import { activity, companyScope, requireActiveCompany, scope } from "@/lib/requests/guards";
import { principal } from "@/lib/users/test-fixtures";
import type { ClientPrincipal, SdkStaffPrincipal } from "@/types";

const owner = principal("owner") as ClientPrincipal;
const staff = principal("sdk-admin") as SdkStaffPrincipal;

const mocks = vi.hoisted(() => ({
  company: { findFirst: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ company: mocks.company }),
}));

beforeEach(() => {
  mocks.company.findFirst.mockReset();
});

describe("request guards", () => {
  it("scopes by invoking the permission guard", () => {
    expect(scope(principal("owner"), "request:update", "company-1")).toMatchObject({
      kind: "client",
    });
    expect(() => scope(principal("owner"), "request:update")).toThrow(
      "Client permission checks require a company scope."
    );
    expect(() => scope(principal("unassigned"), "request:view")).toThrow(
      "Application access has not been assigned."
    );
    expect(() => scope(principal("delivery"), "staff:update")).toThrow(
      "Missing permission: staff:update"
    );
  });

  it("resolves client company scope and blocks cross-company scopes", () => {
    expect(companyScope(owner, "company-1")).toBe("company-1");
    expect(() => companyScope(owner)).toThrow("A target company is required for resource access.");
    expect(() => companyScope(owner, "company-2")).toThrow("Cross-company access is denied.");
  });

  it("requires an explicit company for every SDK staff scope", () => {
    expect(companyScope(staff, "company-1")).toBe("company-1");
    expect(() => companyScope(staff)).toThrow("A target company is required for resource access.");
  });

  it("skips the company lookup for client scopes", async () => {
    await requireActiveCompany(owner, "company-1");
    expect(mocks.company.findFirst).not.toHaveBeenCalled();
  });

  it("rejects inactive companies for SDK staff scopes", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    await expect(requireActiveCompany(staff, "company-1")).resolves.toBeUndefined();

    mocks.company.findFirst.mockResolvedValue(null);
    await expect(requireActiveCompany(staff, "company-1")).rejects.toThrow("Company not found.");
  });

  it("builds an activity event carrying status transitions", () => {
    expect(activity("company-1", "user-1", "REJECTED", "IN_REVIEW", "REJECTED")).toEqual({
      companyId: "company-1",
      actorId: "user-1",
      type: "REJECTED",
      fromStatus: "IN_REVIEW",
      toStatus: "REJECTED",
    });
  });
});
