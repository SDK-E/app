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

`scripts/agent-pr-eval.ts` runs on every PR via CI:

- **Required sections:** What changed / Why / How verified / Residual risk
- **Forbidden files:** `.env*`, `src/generated/*`, build output, binaries >500 KB
- **High-blast-radius paths:** `authorization.ts`, `auth.ts`, `identity*.ts`, `schema.prisma`, `migrations/*`, `proxy.ts`, `middleware.ts`, `locales/*`, `package.json`
- **Bug-fix rule:** PR must cite failing test / repro evidence

## Verify Chain

```bash
npm run verify
# generate → agents:check → format:check → typecheck → lint → vitest → i18n:check → build
```

Warnings, notices, and skipped items = fail. Read full output and fix.

## Agent Contract

`scripts/check-agent-contract.ts` validates:

- MCP server parity across `.mcp.json`, `kilo.jsonc`, `opencode.json`
- Agent configs reference correct filenames (`kilo.jsonc`, `opencode.json`)
