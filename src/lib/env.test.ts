import { describe, expect, it } from "vitest";

import { normalizePostgresSslMode } from "@/lib/env";

describe("normalizePostgresSslMode", () => {
  it.each(["prefer", "require", "verify-ca"])(
    "preserves the current secure behavior of sslmode=%s",
    (mode) => {
      expect(
        normalizePostgresSslMode(`postgresql://user:secret@db.example.test/app?sslmode=${mode}`)
      ).toBe("postgresql://user:secret@db.example.test/app?sslmode=verify-full");
    }
  );

  it("preserves explicit modes and unrelated query parameters", () => {
    expect(
      normalizePostgresSslMode(
        "postgresql://user:secret@db.example.test/app?connect_timeout=10&sslmode=verify-full"
      )
    ).toBe("postgresql://user:secret@db.example.test/app?connect_timeout=10&sslmode=verify-full");
  });
});
