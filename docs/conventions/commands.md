# Project Commands

All commands run from the repository root via pnpm workspaces + Turborepo.

## Development

```bash
pnpm install        # Install all workspace dependencies
pnpm run dev        # Start web dev server (Turbopack)
pnpm run build      # prisma generate + turbo run build
pnpm run start      # Start production server
```

## Code Quality

```bash
pnpm run lint         # ESLint (whole monorepo)
pnpm run typecheck    # tsc --noEmit (whole monorepo)
pnpm run verify       # Full chain: generate → format:check → typecheck → lint → knip → i18n:check → test:run → build
pnpm run format       # Prettier write
pnpm run format:check # Prettier check (in verify)
```

## Testing

```bash
pnpm run test          # Vitest (watch mode)
pnpm run test:run      # Vitest (single run, all workspaces)
pnpm run test:coverage # Vitest with coverage
pnpm run i18n:check    # Validate all 17 locale catalogs
```

## Prisma

Prisma config lives in `packages/db` (`packages/db/prisma.config.ts`). Run the
root scripts; they delegate into the `@platform/db` workspace.

```bash
pnpm run generate            # Generate client (root script)
pnpm --filter @platform/db exec prisma migrate dev       # Create migration (ask)
pnpm run db:migrate          # Deploy migrations (deny for prod targets)
pnpm --filter @platform/db exec prisma migrate reset     # Reset DB (deny)
pnpm --filter @platform/db exec prisma db push           # Push schema (ask)
pnpm --filter @platform/db exec prisma migrate status    # Check status (ask)
```

## Mail

The mail sink is the standalone shared service [`@sdk-e/mailbox`](https://github.com/SDK-E/mailbox).
Start it once per machine (not per project), then inspect from here:

```bash
pnpm dlx @sdk-e/mailbox         # Run the shared sink (SMTP :11025, inbox UI + HTTP API :11090)
pnpm dlx @sdk-e/mailbox open    # Open the inbox UI in a browser (health-checks first)
pnpm dlx @sdk-e/mailbox list    # List emails
pnpm dlx @sdk-e/mailbox read -- <id>  # Read email body
pnpm dlx @sdk-e/mailbox wait "match"  # Wait for matching email
pnpm dlx @sdk-e/mailbox clear  # Empty sink
pnpm dlx @sdk-e/mailbox health # Check mailbox health
```

## Assets

```bash
pnpm run bg:remove -- <image> [image...] [--border-tolerance <n>] [--uniform-tolerance <n>]
# Remove a flat, uniform background from raster images in place (flood fill
# from the borders + near-background sweep). Requires alpha-capable output:
# .png, .webp, .avif, .tiff, .gif. Destructive — keep files under version control.
```

## Ports

```bash
pnpm run port:list | port:find | port:pid | port:check | port:kill | port:kill-force
```

## Agent Checks

```bash
pnpm run agents:check       # Validate agent contract (MCP parity, required paths/scripts)
pnpm run lint               # ESLint (incl. 250-line file cap via max-lines rule)
pnpm run contrast:check     # Rendered text-contrast audit (light + dark)
```
