import { describe, it, expect } from "vitest";
import { cn, formatDate, slugify } from "./utils";

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
});
