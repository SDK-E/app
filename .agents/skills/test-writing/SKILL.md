---
name: test-writing
description: >
  Use when writing or reviewing unit tests for this repo — new test files,
  missing coverage, weak assertions, mock misuse, or any "write a test" /
  "add tests for" / "improve coverage" / "why is this untested" request.
  Covers Vitest 4 conventions, behavior-over-implication testing, boundary
  mocking, scenario/flow coverage, assertion quality, warnings-as-failures,
  and repro-first bug discipline.
license: Apache-2.0
---

# Test writing

The test suite is the boundary that stops regressions reaching production. Every test names the behavior it protects; every suite is readable as a specification of what the code does and what must not break.

## When to Use

- User asks to write, add, or improve tests.
- Coverage falls below the floor (lines 43 / statements 40 / functions 46 / branches 31 in `vitest.config.ts`).
- Existing tests use tautologies, mock internals, or pass with warnings.
- A bug fix needs a failing-then-passing regression test.
- User mentions: _coverage_, _test_, _spec_, _Vitest_, _mutation_, _mock_, _regression_, _repro_.

## When Not to Use

- User wants an E2E flow → Playwright.
- User wants to send a real email → the `resend-email` skill.
- User wants a Prisma schema or migration → the `prisma-next-*` skills.
- User wants to debug a failing test → fix the failure first, then apply these rules to any new tests you add.

## Critical Rules

- **Behavior, not implementation.** Assert observable inputs → outputs, state transitions, decisions, and rendered UI. A refactor that preserves behavior must not break the suite.
- **Atomic intent coverage.** One test per behavior, named as a scenario. Cover every branch, guard, transition, and error path. Use `it.each` for decision tables.
- **Mock only true boundaries.** Auth0, next-intl, network, time, Prisma, Resend, and filesystem are boundaries. Never mock the unit under test; never mock-to-force-a-return.
- **Assert real outcomes.** Use `getByRole` / `queryByRole` for UI; assert specific error types and messages; no tautologies, no logic snapshots.
- **Warnings are failures.** A passing run that emits warnings, notices, or skipped tests is NOT green. Zero-warning exit only.
- **Repro-first for bugs.** A bug fix ships with a test that fails before the fix and passes after.
- **Reproduce the measured exemplars.** Strongest modules in coverage today: `src/lib/authorization.ts` (~81% lines) and `src/lib/identity.ts` (~81% lines) — read their tests for the expected shape. Weakest modules needing next attention: `src/lib/env.ts`, `src/lib/db.ts`, `src/lib/data/serviceRequests.ts` (13–19% lines).
- **No new dependencies.** Vitest 4, Testing Library, and jsdom are already in `devDependencies`.

## Repo Conventions

| Convention    | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Runner        | Vitest 4 (`vitest.config.ts`)                             |
| Environment   | `jsdom`                                                   |
| File location | Co-located: `src/**/*.test.{ts,tsx}`                      |
| Alias         | `@/` → `./src`                                            |
| Cleanup       | Call `cleanup()` in `afterEach` for React Testing Library |
| Command       | `pnpm run test:run` (CI), `pnpm run test` (watch)         |
| Coverage      | `pnpm run test:coverage` — passes at floor 43/40/46/31    |

## Writing a New Test File

1. Import only from the module under test and its public API.
2. Build minimal factory functions for inputs — never reach into private fields.
3. Name tests as scenarios: `"returns null when the principal is unassigned"` not `"test 1"`.
4. For decision tables, use `it.each` with labelled arrays:
   ```ts
   it.each([
     ["SUBMITTED", "start-review", "IN_REVIEW"],
     ["DRAFT", "start-review", null],
   ] as const)("transitions %s + %s → %s", (from, decision, expected) => {
     expect(resolveTransition(from, { decision })).toEqual(expected);
   });
   ```
5. For component tests, query by accessible role/text, not by test IDs or CSS classes.
6. Assert the specific failure: `toThrowError(ExpectedError)` with a message check, not just `toThrow()`.
7. Run `pnpm run test:run` and confirm zero warnings.

## Mocking Boundaries

Mock at the seam, not inside the unit:

```ts
// ✓ correct — mock the db module boundary
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({ user: { upsert: vi.fn(), findUnique: vi.fn() } }),
}));

// ✗ wrong — mocking internals of the module under test
const spy = vi.spyOn(moduleUnderTest, "privateHelper");
```

Reset mocks in `beforeEach`:

```ts
beforeEach(() => {
  vi.resetAllMocks();
});
```

## Assertion Quality

| Bad                                       | Good                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `expect(result).toBeTruthy()`             | `expect(result.status).toBe("active")`                                        |
| `expect(fn).toThrow()`                    | `expect(fn).toThrowError(ValidationError)`                                    |
| `expect(component).toBeDefined()`         | `expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()` |
| `expect(obj).toEqual(snapshot)` for logic | `expect(obj.total).toBe(42); expect(obj.items).toHaveLength(3)`               |

## Coverage Targets

The floor is set at measured values × 0.85 (lines 43, statements 40, functions 46, branches 31). Floors only rise. When measured coverage exceeds the floor by ≥15 points, re-measure and raise the floor.

`perFile` thresholds are NOT enabled globally — weak modules (`env.ts`, `db.ts`, `serviceRequests.ts`) would fail the gate today. Raise them through targeted tests, not a global hammer.

## Workflow

1. Run `pnpm run test:coverage` to see the current state.
2. Identify the weakest module below the floor.
3. Write tests for every branch/guard/transition in that module.
4. Re-run coverage — confirm the module crosses the floor.
5. Run `pnpm run verify` — full chain must be green with zero warnings.
