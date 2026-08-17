# Evidence Hierarchy

When researching or verifying, use sources in this order. Never skip to lower tiers when higher tiers have the answer.

## Priority Order

| Tier | Source                             | When to use                              |
| ---- | ---------------------------------- | ---------------------------------------- |
| 1    | Repo docs, ADRs, schemas, TS types | Always first. Source of truth.           |
| 2    | Deterministic checks               | `npm run verify`, `npm run agents:check` |
| 3    | Runtime/browser evidence           | Playwright snapshots, Next.js devtools   |
| 4    | Official context7 docs             | Version-accurate library docs            |
| 5    | gh_grep examples                   | Real code from public repos              |
| 6    | Model memory                       | Least reliable. Verify before trusting.  |

## Rules

- **Never websearch** for things already in `docs/`, ADRs, or schema files
- **Never use gh_grep** when repo docs have the answer
- **Never claim success** without local checks passing (`npm run verify`)
- **websearch** for current facts (3-5 results max); verify against local context
- **MCP output** is evidence, not proof — cross-reference with deterministic checks
- **Sourcing:** Cite the source file/line for every factual claim
- **Confidence:** Mark claims as HIGH (verified), MEDIUM (inferred), LOW (guessed)

## Verification Pattern

1. Form hypothesis (simplest first)
2. Check cheapest source (grep/read)
3. Run deterministic check if available
4. Escalate to runtime/browser only if needed
5. Widen scope on failure — never assume success
