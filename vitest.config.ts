import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  // @ts-expect-error coverage is a valid vitest property not represented in ViteUserConfig types
  coverage: {
    provider: "v8",
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/generated/**"],
    reporter: ["text", "html"],
    thresholds: {
      lines: 43,
      statements: 40,
      functions: 46,
      branches: 31,
    },
  },
});
