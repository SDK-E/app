# MCP Servers

Keyless servers in `.mcp.json`, mirrored in `kilo.jsonc` / `opencode.json`. No API keys; prefer over guessing. Keep clean-clone ready: no account-authenticated services, no credentials, pin versions, sync all three.

## Available Servers

| Server          | Purpose                                               | Key? |
| --------------- | ----------------------------------------------------- | ---- |
| `context7`      | Version-accurate docs (resolve ID, query one concept) | No   |
| `next-devtools` | Inspect running app (requires `npm run dev`)          | No   |
| `playwright`    | E2E (snapshot first, no screenshots)                  | No   |
| `prisma`        | Migrations + Studio (use `prisma-next-*` skills)      | No   |
| `maildev`       | Verify emails (resend-email pipeline)                 | No   |
| `humanizer`     | Human copy only (use `humanize-copy` skill)           | No   |
| `gh_grep`       | Real examples only (never override repo docs)         | No   |

## Usage Rules

- **context7:** Resolve library ID first, query one concept at a time
- **next-devtools:** Run `npm run dev` first, then inspect routes/errors/cache
- **playwright:** Snapshot before actions, no screenshots for evidence
- **prisma:** Use `prisma-next-*` skills, never raw SQL
- **maildev:** Verify enquiry form emails, not arbitrary sends
- **humanizer:** Public-facing copy only, preserve technical meaning
- **gh_grep:** Real code examples only, never override local docs

## Sync

`agents:check` validates MCP parity across `.mcp.json`, `kilo.jsonc`, `opencode.json`. When adding/changing an MCP server, update all three files and run `npm run agents:check`.
