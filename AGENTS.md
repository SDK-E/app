# AGENTS.md

## Tech stack (exact versions)

Do not assume versions — the exact stack is:

- **Next.js 16.3.1** — App Router only (no Pages Router, no `pages/`, no `getServerSideProps`)
- **React 19.2.8** + **TypeScript 5** (`strict: true`)
- **Tailwind CSS v4** — styling only (no CSS modules, no styled-components)
- **Prisma 7.9.1** (Postgres) — all data access; **zod 4.4.3** — all validation
- **@auth0/nextjs-auth0 4.26.0** — authentication
- **Vitest 4** + Testing Library — unit tests; Playwright — E2E (`tests/`)
- Path alias `@/*` → `./src/*`

## Coding standards (write standard, project-idiomatic code)

**Use:**

- Tailwind utility classes for all styling.
- `getServerEnv()` / `publicEnv` from `@/lib/env` — never `process.env` directly.
- Auth helpers: `getAuth0Client()` from `@/lib/auth`; `requireAuth`, `requireRole`,
  `requireCompanyAccess` from `@/lib/auth-guards`.
- zod for env/input validation (see `src/lib/env.ts`).
- Prisma for every DB operation (see the `prisma-next-*` skills) — never raw SQL.
- Server components by default; `"use client"` only when interactivity requires it;
  `route.ts` handlers are server-only.
- One component per file; named exports for shared components, default exports for routes.
- Route dirs `kebab-case`; reserved route files only (`page.tsx`, `layout.tsx`, ...).
- Import order: builtin → external → internal `@/` → relative.

**Do NOT:**

- Invent file paths or helper functions — verify they exist with grep/glob first.
- Assume unstated requirements or context (team size, sharing needs, deployment
  targets, who will use the code). Ask the user instead of building for a
  hypothetical audience.
- Add a new dependency when Next, Prisma, zod, or Auth0 already cover the need.
- Invent library APIs or config keys — check `context7` or the installed types first.
- Use Pages Router patterns, `next/router`, or `getServerSideProps`.
- Write `any` without a justification comment.
- Edit `src/app/globals.css` for component styles.
- Create files at the repo root, or pre-create empty `prisma/` / `tests/` dirs.
- Commit `.env*` files, generated artifacts, `node_modules`, or `.next/`.
- Guess Auth0 session / Prisma result shapes — use the typed helpers above.

## Verify before claiming

- After any code change run: `npm run typecheck && npm run lint && npm run test`.
- Migrations: review every line, then `npx prisma migrate dev`.
- Never claim a change "works" without running the checks.
- Prefer small, focused edits verified incrementally over one big rewrite.

## MCP servers

Keyless MCP servers are configured in `.mcp.json` (read by Claude Code, Cursor,
Windsurf, VS Code, Zed, etc.) and mirrored for opencode in `opencode.json`.
Any agent can start using them right after `npm install` — no API keys required.
Prefer them over guessing: they are the cheapest way to avoid hallucinations.

- **context7** — version-accurate docs for the libraries in this repo
  (Next.js, React, Prisma). Use when you need library/docs help.
- **next-devtools** — Next.js internals (routes, server actions, bundler).
  Requires `npm run dev` to be running.
- **playwright** — browser automation for end-to-end flows (e.g. the Auth0
  login flow).
- **prisma** — Prisma CLI operations (migrate, generate, studio) directly from
  the agent. Reads this project's `prisma.config.ts`.
- **gh_grep** — real-world code examples from GitHub (grep.app). Use when
  unsure how something is done in practice.

## Docs

`docs/` is the source of truth for how this codebase is built. Read the
relevant file before touching code:

- `docs/conventions/structure.md` — directory layout, component/route/env
  conventions, commit-message style (mandatory).
- `docs/conventions/env.md` — every env var, its requirement level, and local
  setup.
- `docs/architecture/*` — auth, RBAC, identity, resource isolation.
- `docs/adr/*` — decisions behind the stack (Auth0, role model, isolation,
  database choice).

In opencode, these are also exposed as an `@docs` reference.

## Skills

Skills live in `.agents/skills/` and are committed:

- `prisma-next-quickstart`, `prisma-next-queries`, `prisma-next-migrations`,
  `prisma-next-debug` — Prisma + Next.js workflows.
- `deploy-to-vercel`, `vercel-cli-with-tokens` — Vercel deploys.
- `author-auth0-skill` — Auth0.
- opencode loads these via `skills.paths` in `opencode.json`; other agents
  scan `.agents/skills/` themselves.

## Project commands

```bash
npm run dev         # Start dev server (Turbopack)
npm run build       # prisma generate + production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest
npx prisma migrate dev
npx prisma db seed  # DEVELOPMENT ONLY
```

## Conventions

Follow the docs above: read `docs/conventions/structure.md` before writing any
code — its directory layout, component/route/env conventions, and
commit-message style are mandatory.
