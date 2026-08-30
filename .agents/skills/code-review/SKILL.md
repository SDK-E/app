---
name: code-review
description: >
  Use when reviewing a diff or PR for this repo — any "review", "PR review",
  "diff review", "check this change", or "look at this PR". Checks scope-creep,
  silent regression, context blindness, lockfile/schema/security-path
  justification, and test coverage of the change.
license: MIT
---

# Code review

Review a diff or pull request against the task it was meant to solve. Return a
short synthesis: finding, file, severity, confidence, next action.

## When to Use

- User asks to review a diff, PR, or set of changed files.
- User says _"review this"_, _"check the PR"_, _"does this look right"_,
  _"look at this change"_, _"diff review"_.
- A review subagent (`@review`) is invoked for a read-only pass.

## When Not to Use

- User wants to implement the change → normal coding flow.
- User wants a test written → the `test-writing` skill.
- User wants a bug fixed → the `bugfix` skill.

## Review Dimensions

Check each dimension that applies to the diff. Mark findings as
`severity: high | medium | low` and `confidence: high | medium | low`.

### 1. Scope-creep

The diff should do exactly what the task requires — no extra refactors,
renames, formatting sweeps, or unrelated cleanups.

- Does every changed file map to a stated requirement?
- Are there deleted or modified files the task did not mention?

### 2. Silent regression

The diff should not break behaviour the task did not intend to change.

- Run the relevant tests (`pnpm run test:run` or the targeted suite).
- Check for changed return types, removed guards, altered error paths, or
  renamed exports that call sites still reference.
- Verify `pnpm run verify` is green after applying the diff locally.

### 3. Context blindness

Every new import, API call, schema field, or helper must exist in the codebase
or be added in the same diff.

- Search for referenced symbols — do they resolve?
- Does the new code follow the repo conventions in
  `docs/conventions/structure.md` and `AGENTS.md`?

### 4. Lockfile / schema / security-path justification

Changes to `package.json`, `package-lock.json`, `prisma/schema.prisma`,
`prisma/migrations/*`, `src/lib/authorization.ts`, `src/lib/auth.ts`,
`src/lib/identity*.ts`, `src/proxy.ts`, `src/middleware.ts`, `src/locales/*`,
and any env var access need explicit rationale.

- Is the change explained in the PR body or commit message?
- Does the diff introduce a new dependency without exhausting what Next,
  Prisma, zod, or Auth0 already provide?
- Does the change reduce tenant isolation or weaken auth checks?

### 5. Tests exercise the change

A behavioural change without a test is a review finding.

- New behaviour: at least one test asserting the new outcome.
- Bug fix: a regression test that fails before the fix and passes after.
- Changed edge case: the test covers the boundary that changed.

## Synthesis Output

Return a compact block per finding. If the diff is clean, return a single
approval line.

```
[SEVERITY] [CONFIDENCE] — finding text
  File: path/to/file.ts:42
  Action: what the author should do next
```

Severity:

- `high` — breaks behaviour, weakens security, or adds unexplained schema/lockfile changes.
- `medium` — missing test, style/convention violation, or unnecessary scope creep.
- `low` — nit: naming, comment clarity, or minor consistency issue.

Confidence:

- `high` — verified by reading the code and (where practical) running the tests.
- `medium` — read the code but did not run the tests.
- `low` — static inspection only, execution context unclear.

If no findings:

```
APPROVED — no scope-creep, silent regression, context blindness, or
unjustified lockfile/schema/security-path changes detected.
```

## Checklist

- [ ] Diff matches task scope; no unrelated changes.
- [ ] No silent regression — tests pass, behaviour preserved.
- [ ] All new references resolve in the codebase.
- [ ] Lockfile, schema, and security-path changes are justified.
- [ ] Tests exercise the change (new behaviour, bug fix, edge case).
- [ ] `pnpm run verify` is green with zero warnings.
