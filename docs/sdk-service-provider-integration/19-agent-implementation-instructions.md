# Instructions for AI Coding Agents

Use this file together with the other planning documents.

## Mission

Implement the service-provider integration incrementally according to `18-integration-roadmap.md`.

Do not attempt to build the whole platform in one change.

## Before each implementation unit

1. Read `00-master-context.md`.
2. Read the relevant round document(s).
3. Read the exact roadmap step.
4. Inspect the current repository before proposing changes.
5. Identify existing abstractions that should be reused.
6. Confirm the new change does not violate the domain invariants.

## Implementation rules

- Preserve existing application architecture unless a change is necessary.
- Prefer explicit domain concepts over ambiguous booleans.
- Keep provider-side and client-side financial models separate.
- Enforce authorization on the server/API layer.
- Do not rely on hidden UI for security.
- Version commercial agreements and issued documents.
- Do not overwrite historical workflow records.
- Make externally retried operations idempotent.
- Emit meaningful domain events for important transitions.
- Add audit records for privileged/business-critical mutations.
- Add tests for valid and invalid state transitions.
- Add tests for role/permission boundaries.
- Never expose provider compensation or SDK margin to clients.
- Never expose client pricing or SDK margin to providers unless explicitly authorized by product configuration.
- Do not directly couple the domain to a single integration vendor.
- Keep matching separate from selection.
- Keep proposals separate from engagements.
- Keep provider billing separate from client billing.

## For each roadmap step, produce

- Scope summary
- Existing code/components being reused
- Domain changes
- Database/schema changes
- API changes
- UI changes
- Permissions
- Events/notifications
- Audit requirements
- Tests
- Migration/backfill if required
- Acceptance criteria verification

## Stop conditions

Do not silently expand scope into later roadmap steps.

If a dependency is missing, implement only the minimum foundation necessary or explicitly record the dependency for the next step.
