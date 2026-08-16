# Project Structure and Development Conventions

This document defines the directory layout and development conventions for the
Client Platform. **Every worker MUST follow this document.** When in doubt,
refer back here — do not guess.

## 1. Directory Layout

The project is a Next.js 16 application (App Router) with TypeScript, Tailwind
CSS, and ESLint. Application code lives under `src/`; the path alias `@/*`
maps to `./src/*`.

```
.
├── src/                        # Application source root (alias: @/*)
│   ├── app/                    # App Router routes & route groups
│   │   ├── (marketing)/        # Route group (grouped, no URL segment)
│   │   │   └── page.tsx
│   │   ├── api/                # Route handlers (server-only)
│   │   │   └── health/route.ts
│   │   ├── favicon.ico         # Static route file
│   │   ├── globals.css         # Global Tailwind/CSS entry
│   │   ├── layout.tsx          # Root layout (required)
│   │   ├── page.tsx            # Home route ("/")
│   │   ├── error.tsx           # Root error boundary
│   │   ├── not-found.tsx       # 404 UI
│   │   └── loading.tsx         # Suspense fallback
│   ├── components/             # Shared React components (non-route)
│   │   ├── ui/                 # Presentational primitives (Button, Card...)
│   │   └── layout/             # Layout components (Header, Footer, Nav...)
│   ├── lib/                    # Server-only shared utilities
│   │   ├── data/               # Data access (DB queries, repositories)
│   │   ├── utils.ts            # Pure helper functions
│   │   ├── auth.ts             # Auth/session helpers (server-only)
│   │   └── env.ts              # Centralized env var access + validation
│   ├── hooks/                  # Shared React hooks (useX.ts)
│   ├── types/                  # Shared TypeScript types & schemas
│   └── proxy.ts                 # Next.js proxy (formerly middleware) (if needed)
├── prisma/                     # Prisma ORM (schema + migrations)
│   ├── schema.prisma
│   └── migrations/
├── scripts/                    # Dev tooling (run directly, not app code)
│   ├── mail-sink.ts            # Local mail sink (SMTP + HTTP API, no UI)
│   ├── mail-cli.ts             # npm run mail:list / mail:read / mail:wait / ...
│   ├── mail-mcp.ts             # maildev MCP server for agents
│   └── humanizer-mcp.ts        # Keyless copy-humanization MCP server
├── tests/                      # End-to-end tests (Playwright)
│   ├── e2e/
│   └── fixtures/
├── docs/                       # Project documentation
│   └── conventions/            # Convention docs (this file, env.md)
├── public/                     # Static assets served at "/"
│   ├── brand/                  # Approved brand assets (logo + compact mark, see docs/design/brand.md)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .env                        # Local env (gitignored, never commit)
├── .env.local                  # Local overrides (gitignored, never commit)
├── eslint.config.mjs           # ESLint flat config
├── next.config.ts              # Next.js config
├── package.json                # Dependencies & scripts
├── postcss.config.mjs          # PostCSS/Tailwind config
├── tsconfig.json               # TypeScript config
└── README.md                   # Project overview
```

### Where does code go?

| Kind of code | Location | Alias |
|---|---|---|
| Routes, layouts, pages | `src/app/**` | `@/app/**` |
| Shared UI components | `src/components/**` | `@/components/**` |
| Data access, server utils | `src/lib/**` | `@/lib/**` |
| React hooks | `src/hooks/**` | `@/hooks/**` |
| Shared types/schemas | `src/types/**` | `@/types/**` |
| Prisma schema & migrations | `prisma/**` | — |
| Dev tooling (mail sink, CLI, MCP) | `scripts/**` | — |
| E2E tests | `tests/**` | — |
| Static assets (images, fonts) | `public/**` | `/...` |

### Rules

- **Only** route-related files (`page.tsx`, `layout.tsx`, `route.ts`, etc.)
  live in `src/app`. Components and utilities go in `src/components` and
  `src/lib` respectively.
- Do NOT create files at the repository root except documented config files.
- Never edit `src/app/globals.css` for component styles — colocate styles with
  components or use utility classes.
- Never commit `.env*` files. Env variables are documented in
  [env.md](env.md) — no `.env.example` is committed.
- `prisma/` and `tests/` are created when needed; do not pre-create empty dirs.

## 2. Naming Conventions

### Files & directories

| Type | Convention | Example |
|---|---|---|
| Page/route directories | `kebab-case` | `src/app/checkout/` |
| Components (React) | `PascalCase.tsx` | `Button.tsx`, `UserProfile.tsx` |
| Hooks | `useX` camelCase | `useAuth.ts` |
| Utilities / modules | camelCase | `utils.ts`, `formatCurrency.ts` |
| Constants | camelCase (`.ts`) | `siteConfig.ts` |
| Types | `PascalCase` | `User.ts`, `Session.ts` |
| Styles | camelCase `.css` | `globals.css` |
| Test files | `*.test.ts(x)` / `*.spec.ts` | `utils.test.ts`, `checkout.spec.ts` |
| Env docs | `docs/conventions/env.md` | — |

### Components

- One component per file, `PascalCase` filename matching the component name.
- **Default export** for route components (`page.tsx`, `layout.tsx`) and
  page-level components.
- **Named exports** for shared/reusable components in `src/components`.
- Keep components composable: prefer function components, no class components.
- Presentational components in `components/ui/` must be presentational —
  no data fetching, no side effects. Data fetching lives in `lib/`.

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
- Server-only variables are read via `src/lib/env.ts` (single access point,
  validated with schema parsing). Do NOT read `process.env` directly in
  components or `lib/` modules.
- Every variable must be documented in [env.md](env.md) with a description.
- Never commit real values; `.env*` are gitignored.

## 3. Commit Message Conventions

Use **Conventional Commits**: `<type>(<scope>): <subject>`

```
feat(auth): add login flow
fix(checkout): correct tax calculation
docs(structure): document directory conventions
```

### Allowed types

| Type | Use for |
|---|---|
| `feat` | New user-facing or API feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding/fixing tests |
| `docs` | Documentation only |
| `chore` | Tooling, deps, config, housekeeping |
| `build` | Build system / dependency changes |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

### Rules

- Subject is imperative mood, lowercase, no trailing period, ≤ 72 chars.
- Body (optional) explains **why**, not what. Wrap at 72 chars.
- Reference the issue ID in the commit body or subject when applicable:
  `fix(checkout): correct tax calc (app-qyf)`.
- One logical change per commit. Atomic commits only.
- Do NOT commit generated artifacts, `.env*`, `node_modules`, or `.next/`.

## 4. ESLint & Formatting

- ESLint is the only linter (flat config, `eslint.config.mjs`). Run `npm run lint`.
- Follow the recommended Next.js and TypeScript rules. No `any` unless
  explicitly justified with a comment.
- TypeScript `strict: true` is enabled — do not disable it.
- Import order: builtin → external → internal `@/` → relative.

## 5. Development Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # Run ESLint
```

All code must pass `npm run lint` and `npm run build` before submission.
