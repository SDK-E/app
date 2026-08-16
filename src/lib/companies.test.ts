import { describe, expect, it } from "vitest";

import { buildCompanySlug } from "@/lib/companies";

describe("buildCompanySlug", () => {
  it("creates a stable readable prefix with a uniqueness suffix", () => {
    expect(buildCompanySlug("SDK & Partners", "a1b2c3")).toBe("sdk-partners-a1b2c3");
  });

  it("falls back safely when the name has no slug characters", () => {
    expect(buildCompanySlug("東京", "a1b2c3")).toBe("company-a1b2c3");
  });
});
