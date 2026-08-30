import { formatInTimeZone, isValidTimeZone } from "@platform/core/time";
import { describe, expect, it } from "vitest";

describe("time", () => {
  describe("isValidTimeZone", () => {
    it.each([["America/New_York"], ["Europe/London"], ["Asia/Tokyo"], ["UTC"]])(
      "returns true for valid IANA zone %s",
      (tz) => {
        expect(isValidTimeZone(tz)).toBe(true);
      },
    );

    it.each([["Not/A_Zone"], [""], ["US/Eastern/Extra"]])(
      "returns false for invalid zone %s",
      (tz) => {
        expect(isValidTimeZone(tz)).toBe(false);
      },
    );
  });

  describe("formatInTimeZone", () => {
    it("formats a date in the requested timezone", () => {
      const date = new Date("2025-01-15T12:00:00Z");
      const formatted = formatInTimeZone(date, "America/New_York");
      expect(formatted).toMatch(/2025/);
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it("throws for invalid timezone", () => {
      expect(() => formatInTimeZone(new Date(), "Bad/Zone")).toThrow("Invalid IANA timezone");
    });
  });
});
