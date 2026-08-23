# Deterministic Enforcement

Formatter, permissions, and PR gate are deterministic — not prompt preferences.

## Formatter

`opencode.json` configures auto-format on save via Prettier. `verify` includes `format:check` — warnings/notices/skips fail the build.

## Permissions

`opencode.json` and `kilo.jsonc` have identical `permission.bash` rules (last-match-wins):

- **Allow:** Everything by default (`*`: allow)
- **Deny:** `git push --force*`, `git reset --hard *`, `git clean *`, `npx prisma migrate deploy/reset`, `psql *`, `rm -rf*`, `grep *`, `cat *`, `sed *`, `head *`, `tail *`, `awk *`

`.env*` reads denied by default. MCP tools keyed `{server}_{tool}` (single underscore). Websearch and webfetch allowed by default.

## PR Gate

`packages/tooling/src/ci/agent-pr-eval.ts` runs on every PR via CI:

- **Required sections:** What changed / Why / How verified / Residual risk
- **Forbidden files:** `.env*`, `packages/db/src/generated/*`, build output, binaries >500 KB
- **High-blast-radius paths:** `authorization.ts`, `auth0.ts`, `identity*.ts`, `packages/db/prisma/schema*.prisma`, `packages/db/prisma/migrations/*`, `apps/web/src/proxy.ts`, `middleware.ts`, `packages/i18n/src/locales/*`, root `package.json`, lockfiles (`pnpm-lock.yaml`, `package-lock.json`)
- **Bug-fix rule:** PR must cite failing test / repro evidence

## Verify Chain

```bash
pnpm run verify
# generate → agents:check → check:file-length → format:check → typecheck → lint → vitest → i18n:check → build
```

Warnings, notices, and skipped items = fail. Read full output and fix.

The rendered contrast audit is intentionally outside `verify` (it boots a
browser against 23 pages in two themes and dominates chain time). Run it
explicitly when touching UI or design tokens:

```bash
pnpm run contrast:check
```

## Agent Contract

`packages/tooling/src/ci/check-agent-contract.ts` validates:

- MCP server parity across `.mcp.json`, `kilo.jsonc`, `opencode.json`
- Required root scripts present (`agents:check`, `typecheck`, `lint`, `test:run`, `i18n:check`, `build`, `verify`)
- Required paths exist: `docs/conventions/structure.md`, `docs/conventions/env.md`, `packages/env/src/index.ts`, `packages/auth/src/{auth0,identity,authorization}.ts`, `packages/tooling/src/mail/mail-mcp.ts`, `packages/tooling/src/mcp/humanizer-mcp.ts`
