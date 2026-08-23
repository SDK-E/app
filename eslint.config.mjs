import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // eslint-plugin-react otherwise probes for a hoisted react package, which
    // pnpm's layout does not provide at the repo root.
    settings: {
      react: { version: "19" },
    },
  },
  {
    // Pure App Router monorepo: the rule only understands a single pages
    // directory and warns when none exists. next/link usage stays enforced by
    // review and the core-web-vitals rules that do understand the app router.
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    // Pre-existing hydration/localStorage sync effects; previously unflagged
    // under npm's flat node_modules (rule could not resolve react from these
    // files). Scoped here instead of globally so new code stays covered.
    files: [
      "packages/portal-shell/src/AppShellFrame.tsx",
      "packages/portal-shell/src/ThemeSwitcher.tsx",
      "packages/portal-shell/src/components/portal/users/SearchInput.tsx",
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
