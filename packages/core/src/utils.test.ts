import { describe, expect, it } from "vitest";

import { cn, formatDate, maskEmail, normalizeEmail, slugify } from "./utils";

describe("utils", () => {
  it("should pass smoke test", () => {
    expect(true).toBe(true);
  });

  it("cn should filter falsy values", () => {
    expect(cn("foo", false, "bar", null, undefined, "baz")).toBe("foo bar baz");
  });

  it("formatDate should return formatted date", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("slugify should convert text to slug", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it.each([
    ["User@Example.com", "user@example.com"],
    ["  Person@Example.ORG  ", "person@example.org"],
    ["ALREADY-LOWERCASE@example.test", "already-lowercase@example.test"],
  ])("normalizeEmail canonicalizes %s", (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });

  it("maskEmail hides the local part while keeping the domain", () => {
    expect(maskEmail("jane.doe@example.com")).toBe("j*******@example.com");
  });
});
