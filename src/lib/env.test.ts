import { afterEach, describe, expect, it, vi } from "vitest";

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

const validEnv: Array<[string, string]> = [
  ["DATABASE_URL", "postgresql://user:secret@db.example.test/app?sslmode=prefer"],
  ["AUTH0_SECRET", "x".repeat(40)],
  ["AUTH0_ISSUER_BASE_URL", "https://tenant.auth0.example/"],
  ["AUTH0_BASE_URL", "https://sdk.enterprises"],
  ["AUTH0_CLIENT_ID", "client-id"],
  ["AUTH0_CLIENT_SECRET", "client-secret"],
  ["NODE_ENV", "test"],
];

async function loadEnv() {
  vi.resetModules();
  return (await import("@/lib/env")).getServerEnv();
}

describe("getServerEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates a complete environment and normalizes the SSL mode", async () => {
    for (const [key, value] of validEnv) vi.stubEnv(key, value);

    const env = await loadEnv();

    expect(env.DATABASE_URL).toBe(
      "postgresql://user:secret@db.example.test/app?sslmode=verify-full"
    );
    expect(env.AUTH0_ISSUER_BASE_URL).toBe("https://tenant.auth0.example/");
  });

  it("derives the issuer URL from AUTH0_DOMAIN", async () => {
    for (const [key, value] of validEnv) {
      if (key !== "AUTH0_ISSUER_BASE_URL") vi.stubEnv(key, value);
    }
    vi.stubEnv("AUTH0_DOMAIN", "tenant.auth0.example");

    const env = await loadEnv();

    expect(env.AUTH0_ISSUER_BASE_URL).toBe("https://tenant.auth0.example");
  });

  it("requires an issuer or domain", async () => {
    for (const [key, value] of validEnv) {
      if (key !== "AUTH0_ISSUER_BASE_URL") vi.stubEnv(key, value);
    }

    await expect(loadEnv()).rejects.toThrow("AUTH0_ISSUER_BASE_URL or AUTH0_DOMAIN is required");
  });

  it("rejects a short auth secret", async () => {
    for (const [key, value] of validEnv) {
      if (key === "AUTH0_SECRET") vi.stubEnv(key, "short");
      else vi.stubEnv(key, value);
    }

    await expect(loadEnv()).rejects.toThrow("AUTH0_SECRET must be at least 32 characters");
  });

  it("rejects a malformed database URL", async () => {
    for (const [key, value] of validEnv) {
      if (key === "DATABASE_URL") vi.stubEnv(key, "not-a-url");
      else vi.stubEnv(key, value);
    }

    await expect(loadEnv()).rejects.toThrow("DATABASE_URL must be a valid database connection URL");
  });
});
