import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildCompanySlug, generateAccessCode, regenerateCompanyAccessCode } from "@/lib/companies";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => ({
  company: { findUnique: vi.fn(), update: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ company: mocks.company }),
}));

beforeEach(() => {
  mocks.company.findUnique.mockReset();
  mocks.company.update.mockReset();
});

describe("buildCompanySlug", () => {
  it("creates a stable readable prefix with a uniqueness suffix", () => {
    expect(buildCompanySlug("SDK & Partners", "a1b2c3")).toBe("sdk-partners-a1b2c3");
  });

  it("falls back safely when the name has no slug characters", () => {
    expect(buildCompanySlug("東京", "a1b2c3")).toBe("company-a1b2c3");
  });
});

describe("generateAccessCode", () => {
  it("produces an 8-character XXXX-XXXX uppercase code", () => {
    expect(generateAccessCode()).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("produces distinct codes across calls", () => {
    expect(generateAccessCode()).not.toBe(generateAccessCode());
  });
});

describe("regenerateCompanyAccessCode", () => {
  it("rotates the access code for the principal's own company", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-1", accessCode: "OLD-CODE" });
    mocks.company.update.mockImplementation(async ({ data }) => ({
      id: "company-1",
      accessCode: data.accessCode,
    }));

    const result = await regenerateCompanyAccessCode(principal("owner"), "company-1");

    expect(mocks.company.findUnique).toHaveBeenCalledWith({ where: { id: "company-1" } });
    expect(result.accessCode).not.toBe("OLD-CODE");
    expect(result.accessCode).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("lets SDK administrators rotate any company's code", async () => {
    mocks.company.findUnique.mockResolvedValue({ id: "company-2" });
    mocks.company.update.mockImplementation(async ({ data }) => ({
      id: "company-2",
      accessCode: data.accessCode,
    }));

    await regenerateCompanyAccessCode(principal("sdk-admin"), "company-2");

    expect(mocks.company.update).toHaveBeenCalledWith({
      where: { id: "company-2" },
      data: expect.objectContaining({
        accessCode: expect.stringMatching(/^[0-9A-F]{4}-[0-9A-F]{4}$/),
      }),
    });
  });

  it("rejects delivery staff without company update permission", async () => {
    await expect(regenerateCompanyAccessCode(principal("delivery"), "company-1")).rejects.toThrow(
      "Missing permission: company:update"
    );
    expect(mocks.company.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a client rotating another company's code", async () => {
    await expect(regenerateCompanyAccessCode(principal("owner"), "company-2")).rejects.toThrow(
      "Cross-company access is denied."
    );
    expect(mocks.company.findUnique).not.toHaveBeenCalled();
  });
});
