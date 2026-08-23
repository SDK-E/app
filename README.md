# SDK Enterprises - Client Platform

Production-grade SDK foundation for enterprise applications, built as a
pnpm + Turborepo monorepo: Next.js 16 (`apps/web`) with shared domain and UI
packages under `packages/*` (`@sdk-e/*`), TypeScript, and Auth0.

## Conventions

Before working on this project, read [docs/conventions/structure.md](docs/conventions/structure.md).
It defines the workspace layout, package dependency direction, and file,
component, route, env var, and commit message conventions that all
contributors MUST follow.

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, set up your environment variables. All variables are documented with
descriptions in [docs/conventions/env.md](docs/conventions/env.md) — create a
`.env.local` in the repository root with the required values.

Finally, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Seeding (Development Only)

To populate your local database with development seed data:

1. Ensure your database is migrated:

   ```bash
   pnpm --filter @sdk-e/db exec prisma migrate dev
   ```

2. Run the seed script:
   ```bash
   pnpm --filter @sdk-e/db exec prisma db seed
   ```

**Important:** This script is DEVELOPMENT-ONLY. It creates synthetic data with fictional companies, users, and records. Do NOT run it in production.

## Commands

```bash
pnpm run dev        # Start web dev server (Turbopack)
pnpm run build      # prisma generate + turbo production build
pnpm run start      # Serve production build
pnpm run lint       # Run ESLint across the monorepo
pnpm run typecheck  # Run TypeScript compiler
pnpm run test       # Run Vitest across all workspaces
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Authentication:** Auth0
- **Testing:** Vitest + Testing Library
- **Styling:** Tailwind CSS
- **Analytics:** Vercel Analytics
