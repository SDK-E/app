---
name: bugfix
description: >
  Use when fixing a bug in this repo — any "fix", "bug", "broken", "regression",
  "not working", "failing", or error-reported behaviour. Reproduces the failure
  first, forms the simplest hypothesis, routes Prisma errors through
  prisma-next-debug, and ships a regression test with the fix.
license: MIT
---

# Bugfix (repro-first)

Fix bugs in this repo. Every fix starts with a repro, ends with a regression
test, and routes framework errors through the matching debug skill before
changing code.

## When to Use

- User says _"fix this"_, _"it's broken"_, _"regression"_, _"not working"_,
  _"failing"_.
- A test is red, a runtime error fires, or a user reports incorrect behaviour.
- A Prisma error envelope appears — route it before editing anything.

## When Not to Use

- The issue is a missing feature or enhancement → normal implementation flow.
- The issue is a query that needs authoring → the matching `prisma-next-*`
  skill.
- The user wants a review of an existing fix → the `code-review` skill.

## The Repro-First Loop

Do not edit code until you have a repro that fails.

1. **Reproduce the failure.** Run the smallest command that shows the bug:
   a failing test, a script, or a dev-server interaction. Capture the exact
   error message, stack trace, and input that triggers it.
2. **Form the simplest hypothesis.** State one sentence: "I think X causes Y
   because Z." Pick the cheapest check that would confirm or refute it.
3. **Verify the hypothesis.** Run only the check needed. If it confirms the
   hypothesis, fix the smallest possible code path. If it fails, form a new
   hypothesis and repeat. Do not loop through candidate solutions.
4. **Ship the fix with a regression test.** The test must fail before the fix
   and pass after. Name the scenario, not the implementation.
5. **End with `pnpm run verify`.** The full chain must be green with zero
   warnings, notices, or skipped items.

## Prisma Errors → prisma-next-debug

If the failure surfaces as a Prisma Next envelope (`PN-*`, `BUDGET.*`,
`MIGRATION.*`, `RUNTIME.*`, `CONTRACT.*`, `PLAN.*`, `LINT.*`) or a raw
`SqlQueryError`, stop and load the `prisma-next-debug` skill first:

1. Read every field — `code`, `severity`, `why`, `fix`, `meta` (or `details`),
   `where` if present.
2. If `code` is `PN-RUN-3000`, also read `meta.code`.
3. Route on `code` to the next move and chain to the matching authoring skill
   where the table says so.
4. Apply the fix the envelope's `fix` field prescribes.

Do not guess at Prisma APIs, schema names, or capability gates. Re-emit the
contract after any capability change.

## Repo Rules

| Rule            | Value                                                          |
| --------------- | -------------------------------------------------------------- |
| Runner          | Vitest 4 (`vitest.config.ts`)                                  |
| Environment     | `jsdom`                                                        |
| Test location   | Co-located: `src/**/*.test.{ts,tsx}`                           |
| Alias           | `@/` → `./src`                                                 |
| Command         | `pnpm run test:run` (CI), `pnpm run test` (watch)              |
| Regression test | Fails before fix, passes after                                 |
| PR body         | States the repro evidence (test name + input that triggers it) |

## Checklist

- [ ] Reproduced the failure with a deterministic command or test.
- [ ] Stated one hypothesis and verified it with the cheapest possible check.
- [ ] If Prisma error, routed through `prisma-next-debug` before editing.
- [ ] Fixed the smallest code path that resolves the root cause.
- [ ] Added or updated a regression test that fails before the fix.
- [ ] `pnpm run verify` is green with zero warnings, notices, or skips.
- [ ] PR body cites the repro evidence (failing test / input that triggers it).
