# AGENTS.md

## MCP servers

Keyless MCP servers are configured in `.mcp.json` (read by Claude Code, Cursor,
Windsurf, VS Code, Zed, etc.) and mirrored for opencode in `opencode.json`.
Any agent can start using them right after `npm install` — no API keys required.

- **context7** — version-accurate docs for the libraries in this repo
  (Next.js, React, Prisma). Use when you need library/docs help.
- **next-devtools** — Next.js internals (routes, server actions, bundler).
  Requires `npm run dev` to be running.
- **playwright** — browser automation for end-to-end flows (e.g. the Auth0
  login flow).
- **prisma** — Prisma CLI operations (migrate, generate, studio) directly from
  the agent. Reads this project's `prisma.config.ts`.

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

Before touching code, read `docs/conventions/structure.md` — directory layout,
component/route/env conventions and commit-message style are mandatory.
All env vars are documented in `docs/conventions/env.md`.
