# Agent Failure Taxonomy

Classification of failures observed in agent-generated PRs and code changes.

## Review modes

| Tag               | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `review:logic`    | Incorrect behavior, missing guard, wrong condition        |
| `review:typo`     | Copy/identifier misspelling, wrong symbol name            |
| `review:perf`     | Unnecessary re-render, missing memoization, N+1 query     |
| `review:security` | Exposed secret, missing auth check, injection risk        |
| `review:test`     | Missing coverage, tautological assertion, decoration test |
| `review:api`      | Hallucinated path/API, stale import, wrong type shape     |
| `review:contract` | Breaking change without migration, schema drift           |
| `review:style`    | Formatting, naming, structure convention violation        |
| `review:tokens`   | Excessive token use, verbose output, missing compression  |

## Blast-radius bands

| Band     | Paths                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| Critical | `src/lib/authorization.ts`, `src/lib/auth.ts`, `src/lib/identity*.ts`, `prisma/schema.prisma`, `src/proxy.ts` |
| High     | `prisma/migrations/*`, `src/middleware.ts`, `src/locales/*`, `package.json`                                   |
| Medium   | `src/lib/*` (non-critical), `src/app/**/*.tsx`                                                                |
| Low      | `src/components/**/*`, `docs/**`, tests                                                                       |

## Remediation policy

- `review:logic`, `review:security`, `review:contract` → PR blocked until fixed.
- `review:typo`, `review:style` → auto-fix preferred; reviewer may approve with note.
- `review:perf`, `review:test`, `review:api` → reviewer decides; log in review-log.
- `review:tokens` → compress output, use caveman-compress on memory files, reduce verbosity.

## Token reduction failure modes

| Mode                 | Symptom                             | Fix                                     |
| -------------------- | ----------------------------------- | --------------------------------------- |
| Verbose output       | Long explanations, filler phrases   | Apply caveman compression rules         |
| Stale context        | Re-deriving known facts             | Reference docs/ instead of re-searching |
| Unnecessary searches | websearch for things in repo docs   | Follow evidence hierarchy               |
| Large tool output    | cat/awk/sed on files                | Use Read/Grep tools with limits         |
| Memory bloat         | AGENTS.md > 50 lines                | Compress to pointer table format        |
| Redundant reads      | Re-reading same file multiple times | Cache in context, read once             |

## Source

Seeded per `docs/agent/failure-taxonomy.md` convention. Feed Phase 4 eval
harness from the review-log after ≥30 logged tasks.
