import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["src/components/layout/AccountMenu.tsx", "src/components/layout/AccessPending.tsx"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".beads/**",
    ".opencode/**",
    ".runtime/**",
    "coverage/**",
  ]),
]);
