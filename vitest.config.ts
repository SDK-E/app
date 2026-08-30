import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web/src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./apps/web/src/test-utils/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "apps/web/src/**/*.test.{ts,tsx}",
      "packages/*/src/**/*.test.{ts,tsx}",
      "packages/tooling/i18n/**/*.test.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      // Mirrors the pre-monorepo `src/lib/**` + `src/proxy.ts` scope exactly.
      include: [
        "packages/env/src/**/*.{ts,tsx}",
        "packages/db/src/index.{ts,tsx}",
        "packages/core/src/**/*.{ts,tsx}",
        "packages/auth/src/**/*.{ts,tsx}",
        "packages/schemas/src/**/*.{ts,tsx}",
        "packages/users/src/**/*.{ts,tsx}",
        "packages/companies/src/**/*.{ts,tsx}",
        "packages/email/src/**/*.{ts,tsx}",
        "packages/marketing/src/**/*.{ts,tsx}",
        "packages/payments/src/**/*.{ts,tsx}",
        "packages/notifications/src/**/*.{ts,tsx}",
        "packages/providers/src/**/*.{ts,tsx}",
        "packages/requests/src/**/*.{ts,tsx}",
        "packages/opportunities/src/**/*.{ts,tsx}",
        "packages/matching/src/**/*.{ts,tsx}",
        "apps/web/src/lib/**/*.{ts,tsx}",
        "apps/web/src/proxy.ts",
      ],
      exclude: ["**/schemas.ts", "**/generated/**"],
      reporter: ["text", "html"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 75,
        branches: 75,
      },
    },
  },
});
