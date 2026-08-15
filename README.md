# SDK Enterprises - Client Platform

Production-grade SDK foundation for enterprise applications, built with Next.js 15, TypeScript, and Auth0.

## Conventions

Before working on this project, read [docs/conventions/structure.md](docs/conventions/structure.md).
It defines the directory layout and file, component, route, env var, and commit
message conventions that all contributors MUST follow.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, set up your environment variables by copying `.env.example` to `.env` and filling in the required values.

Finally, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Seeding (Development Only)

To populate your local database with development seed data:

1. Ensure your database is migrated:
   ```bash
   npx prisma migrate dev
   ```

2. Run the seed script:
   ```bash
   npx prisma db seed
   ```

**Important:** This script is DEVELOPMENT-ONLY. It creates synthetic data with fictional companies, users, and records. Do NOT run it in production.

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript compiler
npm run test      # Run Vitest
npx prisma db seed # Populate development database with seed data
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Authentication:** Auth0
- **Testing:** Vitest + Testing Library
- **Styling:** Tailwind CSS
- **Analytics:** Vercel Analytics
