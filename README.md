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

## Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript compiler
npm run test      # Run Vitest
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Authentication:** Auth0
- **Testing:** Vitest + Testing Library
- **Styling:** Tailwind CSS
- **Analytics:** Vercel Analytics
