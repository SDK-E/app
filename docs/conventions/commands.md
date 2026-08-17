# Project Commands

## Development

```bash
npm run dev         # Start dev server (Turbopack) + local mail sink
npm run build       # prisma generate + production build
npm run start       # Start production server
```

## Code Quality

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run verify      # Full chain: generate → agents:check → format:check → typecheck → lint → vitest → i18n:check → build
npm run format      # Prettier write
npm run format:check # Prettier check (in verify)
```

## Testing

```bash
npm run test        # Vitest (watch mode)
npm run test:run    # Vitest (single run)
npm run test:coverage # Vitest with coverage
npm run i18n:check  # Validate all 17 locale files
```

## Prisma

```bash
npx prisma generate          # Generate client
npx prisma migrate dev       # Create migration (ask)
npx prisma migrate deploy    # Deploy to prod (deny)
npx prisma migrate reset     # Reset DB (deny)
npx prisma db push           # Push schema (ask)
npx prisma db seed           # Seed DB (DEV ONLY)
npx prisma migrate status    # Check status (ask)
```

## Mail

```bash
npm run mail        # Local mail sink (SMTP :1025, HTTP API :1080)
npm run mail:list   # List emails
npm run mail:read -- <id>  # Read email body
npm run mail:wait "match"  # Wait for matching email
npm run mail:clear  # Empty sink
npm run mail:health # Check mail sink health
```

## Agent Checks

```bash
npm run agents:check  # Validate agent contract (MCP parity, config filenames)
```
