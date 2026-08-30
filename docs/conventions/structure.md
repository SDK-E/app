# Project Structure and Development Conventions

This document defines the directory layout and development conventions for the
Client Platform. **Every worker MUST follow this document.** When in doubt,
refer back here — do not guess.

## 1. Repository Layout (pnpm + Turborepo monorepo)

The repository is a pnpm workspace orchestrated by Turborepo. Application code
lives in `apps/web`; shared domain and UI code lives in `packages/*` under the
`@sdk-e/*` scope. Inside `apps/web`, the alias `@/*` maps to `apps/web/src/*`;
cross-package imports use `@sdk-e/<package>` specifiers.

```
.
├── apps/
│   └── web/                       # Next.js 16 app (@platform/web)
│       ├── src/
│       │   ├── app/               # App Router routes & route groups
│       │   │   ├── [locale]/      # Locale-prefixed routes (marketing + portal)
│       │   │   ├── api/           # Route handlers (server-only)
│       │   │   ├── globals.css    # Global Tailwind/CSS entry
│       │   │   ├── layout.tsx     # Root layout (required)
│       │   │   ├── error.tsx      # Root error boundary
│       │   │   └── not-found.tsx  # 404 UI
│       │   ├── components/        # App-owned components (layout, marketing, portal)
│       │   ├── lib/app/           # App-shell helpers (render-for-page, navigation)
│       │   ├── test-utils/        # Test stubs (server-only mock, etc.)
│       │   └── proxy.ts           # Next.js proxy (formerly middleware)
│       ├── public/                # Static assets served at "/" (brand/, svgs)
│       ├── next.config.ts         # Next config (intl plugin, transpilePackages)
│       ├── postcss.config.mjs     # PostCSS/Tailwind config
│       ├── components.json        # shadcn config
│       └── tsconfig.json          # Extends root tsconfig; @/* -> ./src/*
├── packages/
│   ├── types/                     # @platform/types — RBAC roles, permissions, principals (leaf)
│   ├── config/                    # @platform/config — siteConfig (leaf)
│   ├── env/                       # @platform/env — zod-validated server env
│   ├── db/                        # @platform/db — Prisma schema/migrations + generated client + db singleton
│   ├── core/                      # @platform/core — audit, money, time, state-machine, utils
│   ├── i18n/                      # @platform/i18n — routing, messages, src/locales/<locale>/*.json
│   ├── auth/                      # @platform/auth — Auth0 wiring, identity, authorization
│   ├── schemas/                   # @platform/schemas — shared zod schemas
│   ├── users/ · companies/ · email/ · marketing/ · payments/
│   ├── notifications/ · providers/ · requests/ · opportunities/ · matching/
│   ├── ui/                        # @platform/ui — presentational primitives (+ Section/Container)
│   ├── design-system/             # @platform/design-system — design-system page sections
│   ├── test-support/              # @platform/test-support — shared test fixtures (dev only)
│   └── tooling/                   # @platform/tooling — mail sink/cli/mcp, portkiller,
│                                  #   images, CI gate scripts (src/ci), i18n python
├── docs/                          # Project documentation
│   └── conventions/               # Convention docs (this file, env.md, commands.md)
├── .github/workflows/ci.yml       # CI (pnpm install --frozen-lockfile per job)
├── .env                           # Local env (gitignored, never commit)
├── .env.local                     # Local overrides (gitignored, never commit)
├── eslint.config.mjs              # ESLint flat config (whole monorepo)
├── vitest.config.ts               # Single vitest project for all workspaces
├── turbo.json                     # Turborepo task graph (build depends on db#generate)
├── pnpm-workspace.yaml            # Workspace globs, allowBuilds, overrides
├── package.json                   # Root scripts (verify chain lives here)
├── tsconfig.json                  # Root TS config with @sdk-e/* path mappings
└── README.md                      # Project overview
```

### Package dependency direction (acyclic)

```
types, config, i18n, env  →  db  →  core  →  auth  →  users/schemas
users → companies · requests · notifications(email) · opportunities · matching
email ⇄ none (depends on config/env only) · marketing → email, schemas, db
providers → auth, schemas · matching → providers, opportunities, requests
ui → core · design-system → ui · web → everything above
```

`EligibilityResult` and the eligibility rule functions live in
`packages/opportunities/src/eligibility-rules.ts`; `matching` consumes them
one-way. Never introduce an import from `opportunities` back into `matching`
beyond that edge, or from `email` into `notifications`.

### Where does code go?

| Kind of code                       | Location                                                | Import style                  |
| ---------------------------------- | ------------------------------------------------------- | ----------------------------- |
| Routes, layouts, pages             | `apps/web/src/app/**`                                   | `@/app/**`                    |
| App-owned components               | `apps/web/src/components/**`                            | `@/components/**`             |
| App-shell helpers                  | `apps/web/src/lib/app/**`                               | `@/lib/app/**`                |
| Presentational primitives          | `packages/ui/src/**`                                    | `@platform/ui/X`              |
| Design-system sections             | `packages/design-system/src/**`                         | `@platform/design-system/X`   |
| Domain logic (auth, requests, ...) | `packages/<domain>/src/**`                              | `@sdk-e/<domain>/...`         |
| DB schema, migrations, client      | `packages/db/prisma/**`, `packages/db/src/generated/**` | `@platform/db`                |
| Shared types/RBAC                  | `packages/types/src/**`                                 | `@platform/types`             |
| Locales                            | `packages/i18n/src/locales/**`                          | loaded by `@platform/i18n`    |
| Dev tooling (mail sink, CLI, MCP)  | `packages/tooling/src/**`                               | — (bin scripts)               |
| CI gate scripts                    | `packages/tooling/src/ci/**`                            | — (run via root pnpm scripts) |
| Static assets                      | `apps/web/public/**`                                    | `/...`                        |

### Rules

- **Only** route-related files (`page.tsx`, `layout.tsx`, `route.ts`, etc.)
  live in `apps/web/src/app`. Components and utilities go in
  `apps/web/src/components` and the relevant `packages/*` workspace.
- New shared/domain logic goes into the matching `packages/<domain>` workspace;
  do not grow `apps/web/src/lib`.
- Cross-package imports must go through the package name (`@platform/users`);
  never reach across via relative paths or deep internals of another scope's
  generated output (`@platform/db/client` is the only generated entry).
- Do NOT create files at the repository root except documented config files.
- Never edit `apps/web/src/app/globals.css` for component styles — colocate
  styles with components or use utility classes.
- Never commit `.env*` files. Env variables are documented in
  [env.md](env.md) — no `.env.example` is committed.
- Generated Prisma client output (`packages/db/src/generated/`) is gitignored;
  run `pnpm run generate` after schema changes.

## 2. Naming Conventions

### Files & directories

| Type                   | Convention                   | Example                                          |
| ---------------------- | ---------------------------- | ------------------------------------------------ |
| Page/route directories | `kebab-case`                 | `apps/web/src/app/[locale]/(app)/app/companies/` |
| Components (React)     | `PascalCase.tsx`             | `Button.tsx`, `UserProfile.tsx`                  |
| Hooks                  | `useX` camelCase             | `useAuth.ts`                                     |
| Utilities / modules    | camelCase                    | `utils.ts`, `formatCurrency.ts`                  |
| Constants              | camelCase (`.ts`)            | `site.ts`                                        |
| Types                  | `PascalCase`                 | `User.ts`, `Session.ts`                          |
| Styles                 | camelCase `.css`             | `globals.css`                                    |
| Test files             | `*.test.ts(x)` / `*.spec.ts` | `utils.test.ts`, `checkout.spec.ts`              |
| Env docs               | `docs/conventions/env.md`    | —                                                |

### Components

- One component per file, `PascalCase` filename matching the component name.
- **Default export** for route components (`page.tsx`, `layout.tsx`) and
  page-level components.
- **Named exports** for shared/reusable components in `packages/ui` and
  `apps/web/src/components`.
- Keep components composable: prefer function components, no class components.
- Presentational components in `packages/ui` must be presentational — no data
  fetching, no side effects. Data fetching lives in domain packages.

### Routes (App Router)

- Directory names are `kebab-case` (URL segments).
- Route files are special reserved names:
  - `page.tsx` — page (`.jsx`/`.tsx`)
  - `layout.tsx` — nested layout
  - `template.tsx` — re-mounted layout
  - `loading.tsx` — loading UI
  - `error.tsx` — error boundary
  - `not-found.tsx` — 404
  - `route.ts` — route handler (API), one per file
- Route handlers (`route.ts`) are **server-only**; never import them into
  client components.
- Client components use the `"use client"` directive at the top of the file.

### Environment variables

- Format: `SCREAMING_SNAKE_CASE`.
- Variables exposed to the browser must be prefixed `NEXT_PUBLIC_`; none are
  currently required. `DATABASE_URL`, `AUTH0_CLIENT_ID`, and `AUTH0_SECRET`
  remain server-only.
- Server-only variables are read via `@platform/env` (single access point,
  validated with schema parsing). Do NOT read `process.env` directly in
  components or domain modules.
- Every variable must be documented in [env.md](env.md) with a description.
- Never commit real values; `.env*` are gitignored. `.env`/`.env.local` live at
  the repository root and are loaded by `next.config.ts`, `prisma.config.ts`,
  and the mail tooling.

## 3. Commit Message Conventions

Use **Conventional Commits**: `<type>(<scope>): <subject>`

```
feat(auth): add login flow
fix(checkout): correct tax calculation
docs(structure): document directory conventions
```

### Allowed types

| Type       | Use for                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | New user-facing or API feature                          |
| `fix`      | Bug fix                                                 |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding/fixing tests                                     |
| `docs`     | Documentation only                                      |
| `chore`    | Tooling, deps, config, housekeeping                     |
| `build`    | Build system / dependency changes                       |
| `perf`     | Performance improvement                                 |
| `style`    | Formatting, whitespace (no logic change)                |

### Rules

- Subject is imperative mood, lowercase, no trailing period, ≤ 72 chars.
- Body (optional) explains **why**, not what. Wrap at 72 chars.
- Reference the issue ID in the commit body or subject when applicable:
  `fix(checkout): correct tax calc (app-qyf)`.
- One logical change per commit. Atomic commits only.
- Do NOT commit generated artifacts (`packages/db/src/generated/`), `.env*`,
  `node_modules`, or `.next/`.

## 4. ESLint & Formatting

- ESLint is the only linter (flat config, `eslint.config.mjs` at the repo
  root). Run `pnpm run lint`.
- Follow the recommended Next.js and TypeScript rules. No `any` unless
  explicitly justified with a comment.
- TypeScript `strict: true` is enabled — do not disable it.
- Import order: builtin → external → internal `@sdk-e/*` / `@/*` → relative.
- Prettier (devDependency, `.prettierrc.json`, `printWidth: 100`) handles
  mechanical formatting — wrapping long calls, consistent whitespace. Run
  `pnpm run format` on the files you touch. Do not reformat unrelated files in
  the same change.
- Prettier runs automatically on save via the opencode/kilo formatter hook
  (`custom-prettier` command in `opencode.json`). The `verify` chain includes
  `format:check`; warnings, notices, and skips are treated as failures.
- Structure is the author's job, not the formatter's: one concern per file,
  ~200-line soft cap, domain folders with `index.ts` barrels, and a blank line
  between logical steps (see AGENTS.md "Coding standards"). Prettier collapses
  blank lines but does not add them where a block boundary is missing.

## 5. Development Commands

```bash
pnpm install      # Install all workspaces
pnpm run dev      # Start web dev server (Turbopack)
pnpm run build    # prisma generate + turbo build (production build)
pnpm run start    # Serve production build
pnpm run lint     # Run ESLint across the monorepo
pnpm run generate # Regenerate the Prisma client (packages/db)
```

All code must pass `pnpm run lint` and `pnpm run build` before submission.
