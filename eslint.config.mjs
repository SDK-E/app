import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import promise from "eslint-plugin-promise";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";

const strictRules = {
  "no-var": "error",
  "prefer-const": "error",
  "prefer-rest-params": "error",
  "prefer-spread": "error",
  "@typescript-eslint/ban-ts-comment": ["error", { minimumDescriptionLength: 10 }],
  "@typescript-eslint/no-array-constructor": "error",
  "@typescript-eslint/no-duplicate-enum-values": "error",
  "@typescript-eslint/no-dynamic-delete": "error",
  "@typescript-eslint/no-empty-object-type": "error",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-extra-non-null-assertion": "error",
  "@typescript-eslint/no-extraneous-class": "error",
  "@typescript-eslint/no-invalid-void-type": "error",
  "@typescript-eslint/no-misused-new": "error",
  "@typescript-eslint/no-namespace": "error",
  "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
  "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-require-imports": "error",
  "@typescript-eslint/no-this-alias": "error",
  "@typescript-eslint/no-unnecessary-type-constraint": "error",
  "@typescript-eslint/no-unsafe-declaration-merging": "error",
  "@typescript-eslint/no-unsafe-function-type": "error",
  "@typescript-eslint/no-unused-expressions": "error",
  "@typescript-eslint/no-useless-constructor": "error",
  "@typescript-eslint/no-wrapper-object-types": "error",
  "@typescript-eslint/prefer-as-const": "error",
  "@typescript-eslint/prefer-literal-enum-member": "error",
  "@typescript-eslint/prefer-namespace-keyword": "error",
  "@typescript-eslint/triple-slash-reference": "error",
  "@typescript-eslint/unified-signatures": "error",
};

const stylisticRules = {
  "@typescript-eslint/adjacent-overload-signatures": "error",
  "@typescript-eslint/array-type": "error",
  "@typescript-eslint/ban-tslint-comment": "error",
  "@typescript-eslint/class-literal-property-style": "error",
  "@typescript-eslint/consistent-generic-constructors": "error",
  "@typescript-eslint/consistent-indexed-object-style": "error",
  "@typescript-eslint/consistent-type-assertions": "error",
  "@typescript-eslint/consistent-type-definitions": "error",
  "@typescript-eslint/no-confusing-non-null-assertion": "error",
  "@typescript-eslint/no-empty-function": "error",
  "@typescript-eslint/no-inferrable-types": "error",
  "@typescript-eslint/prefer-for-of": "error",
  "@typescript-eslint/prefer-function-type": "error",
};

const importRules = {
  "import/no-unresolved": "error",
  "import/named": "error",
  "import/namespace": "error",
  "import/default": "error",
  "import/export": "off",
  "import/no-named-as-default": "warn",
  "import/no-named-as-default-member": "warn",
  "import/no-duplicates": "error",
  "import/no-cycle": "error",
  "import/no-relative-parent-imports": "off",
  "import/no-extraneous-dependencies": "error",
};

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,

  // eslint-plugin-security — detect unsafe patterns
  security.configs.recommended,

  // eslint-plugin-promise — async/promise correctness
  promise.configs["flat/recommended"],

  // eslint-config-prettier — disables ESLint formatting rules that conflict
  eslintConfigPrettier,

  {
    settings: {
      react: { version: "19" },
      "import/resolver-typescript": {
        project: "tsconfig.eslint.json",
      },
      "import/core-modules": ["server-only", "react", "react-dom"],
    },
    plugins: {
      import: importPlugin,
      sonarjs: { ...sonarjs, rules: sonarjs.rules },
      perfectionist: perfectionist,
      "unused-imports": unusedImports,
    },
    rules: {
      // --- File length (replaces custom check-file-length.ts script) ---
      "max-lines": [
        "error",
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "error",
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
        },
      ],

      // --- Complexity (info-level: tracked in code review, not enforced in CI) ---
      complexity: "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/max-lines-per-function": "off",
      "max-lines-per-function": "off",
      "sonarjs/no-duplicate-string": "off",

      // --- SonarJS code quality ---
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-misleading-array-reverse": "error",
      "sonarjs/no-useless-intersection": "error",
      "sonarjs/no-nested-template-literals": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-redundant-assignments": "error",

      // --- Security overrides ---
      "security/detect-object-injection": "off",
      "security/detect-unsafe-regex": "off",

      // --- TypeScript strictness (extracted from tseslint strict + stylistic) ---
      ...strictRules,
      ...stylisticRules,

      // --- Import rules (plugin registered by eslint-config-next) ---
      ...importRules,

      // --- Perfectionist: import/export sorting only ---
      "perfectionist/sort-imports": "error",
      "perfectionist/sort-named-imports": "error",
      "perfectionist/sort-exports": "error",
      "perfectionist/sort-named-exports": "error",
      "perfectionist/sort-modules": "error",
      "perfectionist/sort-union-types": "warn",
      "perfectionist/sort-intersection-types": "warn",
      "perfectionist/sort-interfaces": "off",
      "perfectionist/sort-objects": "off",
      "perfectionist/sort-object-types": "off",
      "perfectionist/sort-classes": "off",
      "perfectionist/sort-enums": "off",
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-arrays": "off",
      "perfectionist/sort-sets": "off",
      "perfectionist/sort-maps": "off",
      "perfectionist/sort-switch-case": "off",
      "perfectionist/sort-variable-declarations": "off",
      "perfectionist/sort-heritage-clauses": "off",
      "perfectionist/sort-decorators": "off",
      "perfectionist/sort-array-includes": "off",

      // --- Naming conventions ---
      // Interfaces: PascalCase. By convention, interface-only files use the
      // .interface.ts extension (e.g. user.interface.ts). One interface per file.
      // One class per file is enforced by max-lines.
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
        },
        { selector: "typeAlias", format: ["PascalCase"] },
        { selector: "enum", format: ["PascalCase"] },
        { selector: "enumMember", format: ["camelCase", "PascalCase"] },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        { selector: "parameter", format: ["camelCase", "snake_case"], leadingUnderscore: "allow" },
        { selector: "classProperty", format: ["camelCase"] },
        {
          selector: "objectLiteralProperty",
          format: ["camelCase", "UPPER_CASE", "snake_case", "PascalCase"],
          filter: { regex: "^(_+|@|[a-zA-Z]+[-:])", match: false },
        },
        { selector: "objectLiteralMethod", format: ["camelCase"] },
        {
          selector: "property",
          format: ["camelCase", "UPPER_CASE", "snake_case"],
          filter: { regex: "^(_+|@|[a-zA-Z]+[-:])", match: false },
        },
        { selector: "typeProperty", format: ["camelCase", "snake_case"] },
        { selector: "method", format: ["camelCase"] },
        { selector: "accessor", format: ["camelCase"] },
      ],

      // --- Unused code ---
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": "error",

      // --- Next.js overrides ---
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/naming-convention": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: [
      "**/jest.config.*",
      "**/vitest.config.*",
      "**/playwright.config.*",
      "**/eslint.config.*",
      "**/knip.json",
      "**/prisma.config.*",
      "**/.prettierrc*",
      "**/next.config.*",
      "**/.prettierrc",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "import/no-extraneous-dependencies": "off",
      "import/no-relative-parent-imports": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "max-lines": "off",
    },
  },
  // --- Test files: test utilities use dynamic paths, unsafe regex, etc. ---
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-empty-function": "off",
      "sonarjs/no-duplicated-branches": "off",
      "import/no-extraneous-dependencies": "off",
      "import/no-relative-parent-imports": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "@typescript-eslint/naming-convention": "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/max-lines-per-function": "off",
      "sonarjs/no-duplicate-string": "off",
      complexity: "off",
      "security/detect-unsafe-regex": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-non-literal-fs-filename": "off",
    },
  },
  {
    // Pre-existing hydration/localStorage sync effects in portal-shell.
    // Scoped here instead of globally so new code stays covered.
    files: [
      "packages/portal-shell/src/AppShellFrame.tsx",
      "packages/portal-shell/src/ThemeSwitcher.tsx",
      "packages/portal-shell/src/components/portal/users/SearchInput.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // TypeScript files: enable type-aware linting via parserOptions.project
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "tsconfig.eslint.json",
      },
    },
  },
  // --- Tooling / CI scripts: internal scripts with inherent complexity ---
  // Security scanners, CI agents, and CLI tooling legitimately use fs and regex
  // with dynamic arguments. Complexity and security patterns are noise here.
  {
    files: [
      "packages/tooling/src/ci/**/*.ts",
      "packages/tooling/src/images/**/*.ts",
      "packages/tooling/src/mcp/**/*.ts",
      "packages/tooling/src/portkiller/**/*.ts",
    ],
    rules: {
      complexity: "off",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/max-lines-per-function": "off",
      "max-lines-per-function": "off",
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
      "security/detect-non-literal-fs-filename": "off",
      "import/no-unresolved": "off",
    },
  },
  // --- Portal component pages: UI components with large JSX trees
  {
    files: [
      "packages/portal-companies/src/**/*.{ts,tsx}",
      "packages/portal-providers/src/**/*.{ts,tsx}",
      "packages/portal-shell/src/**/*.{ts,tsx}",
      "packages/portal-staff/src/**/*.{ts,tsx}",
      "apps/web/src/app/**/*.{ts,tsx}",
    ],
    rules: {
      "max-lines-per-function": "off",
      "sonarjs/max-lines-per-function": "off",
      "sonarjs/cognitive-complexity": "off",
      complexity: "off",
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
    ".kilo/**",
    ".prettierrc",
    "coverage/**",
    ".turbo/**",
    "packages/db/generated/**",
    "packages/i18n/src/locales/**",
  ]),
]);
