import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: [
      "apps/web/src/components/layout/AccountMenu.tsx",
      "apps/web/src/components/layout/AccessPending.tsx",
    ],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    // Pre-existing hydration/localStorage sync effects; previously unflagged
    // under npm's flat node_modules (rule could not resolve react from these
    // files). Scoped here instead of globally so new code stays covered.
    files: [
      "apps/web/src/components/layout/AppShellFrame.tsx",
      "apps/web/src/components/layout/ThemeSwitcher.tsx",
      "apps/web/src/components/portal/users/SearchInput.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    "node_modules/**",
    "**/node_modules/**",
    ".next/**",
    "**/.next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "**/next-env.d.ts",
    ".beads/**",
    ".opencode/**",
    ".runtime/**",
    "coverage/**",
    ".turbo/**",
    "packages/db/generated/**",
  ]),
]);
