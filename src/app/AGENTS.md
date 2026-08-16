# Application routes

These instructions supplement the repository-level `AGENTS.md` for `src/app/**`.

- Use Next.js App Router conventions from the installed Next.js documentation.
- Server Components are the default. Keep client components to the smallest
  interactive leaf.
- Route handlers and Server Actions authorize at the server boundary using the
  resolved application principal, not UI state or raw Auth0 claims.
- Protected routes use `getCurrentPrincipal()` and the authorization helpers in
  `@/lib/authorization`.
- Tenant resource operations derive client scope from the principal and include the
  authorized `companyId` in the database query.
- New public routes must follow the repository SEO, i18n, sitemap, and proxy rules.
