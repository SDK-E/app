# AGENTS.md

## Stack

pnpm workspaces + Turborepo monorepo · Next.js 16 (App Router, `apps/web`) · React 19 · TypeScript 5 (strict) · Tailwind v4 · Prisma 7 (Postgres, `packages/db`) · Auth0 · Vitest 4 · Zod 4 · app alias `@/*` → `apps/web/src/*` · cross-package imports `@sdk-e/<package>`

## Rules

- `pnpm run verify` after every change. Warnings = fail.
- Never raw SQL / `$queryRaw`. Verify models against `packages/db/prisma/schema.prisma`.
- Auth: resolve by Auth0 `sub` only. Never email. Never authorize from browser.
- `companyId` on every read/write. Use `requireCompanyAccess` / `tenantWhere`.
- One component per file. `kebab-case` routes. Split >200-line modules.
- New domain logic goes in its `packages/*` workspace, not `apps/web/src/lib`.
- Read/Grep only. Never `cat`/`sed`/`head`/`tail`/`awk`/`grep -r`.
- Stage explicit paths only. No push/publish unless requested.
- Never add deps without checking existing coverage.

## Docs

`docs/` = source of truth. Read before code.

- `conventions/` — structure, env, agent-config, enforcement, mcp, commands, evidence
- `architecture/` — auth, RBAC, identity, isolation
- `adr/` — stack decisions
- `design/` — brand, tokens, patterns, responsive, seo
- `content/` — voice, claims, marketing, legal

OpenCode: `@docs` reference.

## Skills

`.agents/skills/`: `prisma-next-*`, `deploy-to-vercel`, `vercel-cli-with-tokens`, `author-auth0-skill`, `resend-email`, `i18n`, `humanize-copy`, `public-site`, `test-writing`, `bugfix`, `code-review`, `caveman-compress`. Load via skill tool.

## Identity

Auth0 = sessions. Postgres = identity + roles + permissions + tenant. SDK staff ≠ client. No passwords, fallback credentials, auth bypasses.

## Planning conventions

- Planning phase is business/domain surface only.
- No code, no schema snippets, no Zod schemas, no Prisma models in plans.
- Plans describe: domain concepts, business rules, invariants, edge cases, acceptance criteria, test surface.
- Implementation detail belongs in the implementation commit, not the plan.

<!-- nextjs-agent-rules -->

Breaking changes — read `node_modules/next/dist/docs/` before code. Heed deprecation notices.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
