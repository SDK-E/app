# Project Commands

All commands run from the repository root via pnpm workspaces + Turborepo.

## Development

```bash
pnpm install        # Install all workspace dependencies
pnpm run dev        # Start web dev server (Turbopack) + local mail sink
pnpm run build      # prisma generate + turbo run build
pnpm run start      # Start production server
```

## Code Quality

```bash
pnpm run lint         # ESLint (whole monorepo)
pnpm run typecheck    # tsc --noEmit (whole monorepo)
pnpm run verify       # Full chain: generate → agents:check → check:file-length → format:check → typecheck → lint → vitest → i18n:check → build
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
root scripts; they delegate into the `@sdk-e/db` workspace.

```bash
pnpm run generate            # Generate client (root script)
pnpm --filter @sdk-e/db exec prisma migrate dev       # Create migration (ask)
pnpm run db:migrate          # Deploy migrations (deny for prod targets)
pnpm --filter @sdk-e/db exec prisma migrate reset     # Reset DB (deny)
pnpm --filter @sdk-e/db exec prisma db push           # Push schema (ask)
pnpm --filter @sdk-e/db exec prisma migrate status    # Check status (ask)
```

## Mail

```bash
pnpm run mail        # Local mail sink (SMTP :1025, inbox UI + HTTP API :1080)
pnpm run mail:ui     # Open the inbox UI in a browser (health-checks the sink first)
pnpm run mail:list   # List emails
pnpm run mail:read -- <id>  # Read email body
pnpm run mail:wait "match"  # Wait for matching email
pnpm run mail:clear  # Empty sink
pnpm run mail:health # Check mail sink health
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
pnpm run check:file-length  # Enforce the 250-line cap across apps/ and packages/
pnpm run contrast:check     # Rendered text-contrast audit (light + dark)
```
