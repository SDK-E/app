# Integration Log

This file is my running tracker for the service-provider integration. Each step below is a self-contained prompt I can copy, paste, and run against an agent. I own the sequence; the agent owns the implementation.

**How to use:**

1. Pick the next unchecked step.
2. Copy the prompt block.
3. Launch it in an agent.
4. Review the result.
5. Mark the step done when I am satisfied.

---

## Step 1 — Lay the domain foundations

**Prompt:**

```
Read the docs/sdk-service-provider-integration planning pack, especially 00-master-context.md and 18-integration-roadmap.md Step 1. Then inspect our current codebase to understand what already exists for users, roles, organizations, and money handling.

Build the minimum foundational models and primitives needed for the provider domain:
- A provider identity that is separate from a generic user
- Role and capability authorization that can distinguish provider, client, and SDK staff
- An audit event model for important mutations
- A money/currency primitive
- A timezone/schedule primitive
- Status/state-machine conventions

Do not build any provider-facing UI yet. Only the underlying concepts, database shapes, and rules that later steps will depend on. Follow the existing project patterns. Add tests that prove the role boundaries, status transitions, and money rules work correctly.
```

**Outcome / notes:**

- [x] Provider identity decoupled from generic user
- [x] Role/capability boundaries testable
- [x] Money is currency-aware
- [x] Status transitions enforce rules
- [x] Audit model in place

---

## Step 2 — Provider application and approval flow

**Prompt:**

```
Read 00-master-context.md, 02-onboarding-vetting-profile.md, and 18-integration-roadmap.md Step 2. Then inspect the codebase to understand existing application or onboarding flows.

Build the provider application flow:
- An application record tied to a provider identity
- Draft, save, and submit actions
- Completeness validation before submission
- An admin review queue
- Ability to request changes or approve/reject
- Audit trail for every review transition

Providers must not be able to approve their own application. Rejection and change-request reasons must be stored separately from internal notes. Follow existing form, validation, and API patterns. Add tests for valid and invalid transitions.
```

**Outcome / notes:**

- [x] Incomplete applications blocked from submission
- [x] Provider cannot self-approve
- [x] Every review transition is audited
- [x] Rejection reasons separated from internal notes

---

## Step 3 — Provider profile and skills

**Prompt:**

```
Read 02-onboarding-vetting-profile.md and 18-integration-roadmap.md Step 3. Then inspect the current profile and taxonomy patterns in the codebase.

Build the provider profile and skills layer:
- A provider profile that holds professional details
- A skills taxonomy that SDK can manage
- Provider skill assignments with proficiency levels
- Portfolio, languages, and experience fields
- Visibility settings that control what clients can see

Client-facing views must never expose provider-private or internal SDK data. Providers can suggest skills but cannot directly modify the controlled taxonomy. Reuse existing media and document patterns. Add tests that verify serialization boundaries.
```

**Outcome / notes:**

- [x] Client-safe profile serialization
- [x] SDK-managed skill catalogue
- [x] Provider suggestions separated from controlled taxonomy
- [x] Visibility rules enforced

---

## Step 4 — Verification and commercial readiness

**Prompt:**

```
Read 02-onboarding-vetting-profile.md and 18-integration-roadmap.md Step 4. Then inspect the existing document and verification patterns.

Build verification and commercial readiness:
- Verification records for identity, business, and tax checks
- Evidence document handling
- Contract readiness tracking
- Payout readiness tracking
- Commercial activation checks

Verification requirements must be configurable. Approval and commercial readiness are separate states. Sensitive verification data must be permission-controlled. Add tests that prove only authorized roles can see sensitive fields.
```

**Outcome / notes:**

- [x] Verification requirements configurable
- [x] Approval and commercial readiness are distinct
- [x] Sensitive data permission-controlled

---

## Step 5 — Availability and capacity

**Prompt:**

```
Read 07-provider-portal-ux.md and 18-integration-roadmap.md Step 5. Then inspect existing scheduling, calendar, or availability patterns.

Build availability and capacity:
- Weekly capacity settings
- Availability periods
- Absence handling
- Future reservations
- Capacity calculation

Available capacity must be derived correctly from availability and absences. Future engagements must be able to reserve capacity. Timezone must be preserved. Add tests for capacity math and edge cases like overlapping reservations.
```

**Outcome / notes:**

- [x] Capacity derived correctly
- [x] Future reservations work
- [x] Absence reduces capacity
- [x] Timezone preserved

---

## Step 6 — Provider services catalogue

**Prompt:**

```
Read 07-provider-portal-ux.md and 18-integration-roadmap.md Step 6. Then inspect existing catalogue, product, or service patterns.

Build the provider services layer:
- Service draft and metadata
- Pricing metadata
- Media and assets
- Submit-for-approval action
- SDK moderation workflow
- Publish and unpublish actions

Providers must not be able to self-publish unapproved services. Published service snapshots must be client-safe. Follow existing media and moderation patterns. Add tests for the publish lifecycle.
```

**Outcome / notes:**

- [x] Provider cannot self-publish
- [x] Published snapshot is client-safe
- [x] SDK moderation workflow complete

---

## Step 7 — Client requests and project intake

**Prompt:**

```
Read 09-client-side-integration.md and 18-integration-roadmap.md Step 7. Then inspect existing client request or project intake patterns.

Build client request handling:
- Structured client request intake
- SDK review and conversion workflow
- Project or client need creation
- Internal ownership assignment

Client requests must not automatically become provider-visible. SDK must be able to convert a request into an opportunity. Add tests that prove requests stay internal until explicitly converted.
```

**Outcome / notes:**

- [x] Requests not auto-visible to providers
- [x] SDK can convert to opportunity
- [x] Internal ownership tracked

---

## Step 8 — Opportunity creation and lifecycle

**Prompt:**

```
Read 03-opportunities-matching-proposals.md and 18-integration-roadmap.md Step 8. Then inspect existing opportunity, project, or job patterns.

Build the opportunity domain:
- Opportunity entity with positions and requirements
- Visibility modes: direct, invite-only, eligible-network
- Full lifecycle states
- Attachments
- Internal notes that never leak externally

Direct, invite-only, and eligible-network modes must all work. Internal notes must never be exposed outside SDK. Multi-role opportunities must be supported. Add tests for visibility rules and lifecycle transitions.
```

**Outcome / notes:**

- [x] All visibility modes functional (DIRECT, INVITE_ONLY, ELIGIBLE_NETWORK via setVisibilityMode + enum)
- [x] Internal notes never exposed (role-based safe select strips internalNotes/rejectionFeedback/ownerId; budgets/clientName gated by role + clientIdentityVisible)
- [x] Multi-role opportunities supported (OpportunityPosition with providerCount, multiple roles)

---

## Step 9 — Matching engine V1

**Prompt:**

```
Read 03-opportunities-matching-proposals.md and 18-integration-roadmap.md Step 9. Then inspect existing recommendation, scoring, or matching patterns.

Build matching V1:
- Hard eligibility filters
- Weighted scoring
- Match run execution
- Candidate records with explanations and warnings
- Boost, suppress, and exclude controls
- Configurable weights

Matching must be explainable and repeatable with the same input. Operators must see why providers matched. Manual overrides must be audited. Matching must not change selection state. Add tests for determinism and override auditing.
```

**Outcome / notes:**

- [x] Same input produces explainable results
- [x] Operators see match reasons
- [x] Manual overrides audited
- [x] Matching does not select

---

## Step 10 — Invitations and opportunity browsing

**Prompt:**

```
Read 03-opportunities-matching-proposals.md and 18-integration-roadmap.md Step 10. Then inspect existing notification and feed patterns.

Build invitations and browsing:
- Invitation creation and delivery
- Accept, decline, and expiry handling
- Eligible opportunity browsing for providers
- Save and hide actions
- Notification delivery

Only eligible and authorized providers may see opportunities. Invitation expiry must be deterministic. Notifications must be idempotent. Add tests for eligibility checks and idempotency.
```

**Outcome / notes:**

- [x] Eligibility enforced on browse
- [x] Invitation expiry deterministic
- [x] Notifications idempotent

---

## Step 11 — Proposals

**Prompt:**

```
Read 03-opportunities-matching-proposals.md and 18-integration-roadmap.md Step 11. Then inspect existing proposal, quote, or bid patterns.

Build proposals:
- Proposal draft and submission
- Versioning for revisions
- Provider-facing pricing and availability
- Milestones
- Attachments
- Questions and answers thread
- Revision requests
- Withdrawal and expiry

Submitted proposal versions must be preserved. Revisions must create new versions. Provider and client pricing boundaries must remain intact. Add tests for versioning and boundary enforcement.
```

**Outcome / notes:**

- [ ] Submitted versions preserved
- [ ] Revisions create new versions
- [ ] Pricing boundaries intact

---

## Step 12 — Shortlisting, interviews, and offers

**Prompt:**

```
Read 03-opportunities-matching-proposals.md and 18-integration-roadmap.md Step 12. Then inspect existing selection, interview, or offer patterns.

Build shortlisting and offers:
- Shortlist creation and management
- Interview scheduling and evaluation
- Client approval path where required
- Offer creation and acceptance
- Provider acceptance capture

The workflow must support SDK-only and client-approved paths. Offer acceptance must capture final terms. Rejected candidates must remain historically queryable. Add tests for both approval paths and historical queryability.
```

**Outcome / notes:**

- [ ] SDK-only and client-approved paths work
- [ ] Final terms captured on acceptance
- [ ] Rejected candidates queryable

---

## Step 13 — Engagement core

**Prompt:**

```
Read 04-engagement-work-execution.md and 18-integration-roadmap.md Step 13. Then inspect existing contract, engagement, or project patterns.

Build engagement core:
- Engagement entity linking provider, SDK, and client/project context
- Engagement type and terms versioning
- Lifecycle states
- SOW or scope references
- Contract references

Accepted offers must be able to create engagements. Provider compensation and client pricing must be separate. Terms must be versioned and historical terms must never be silently overwritten. Add tests for separation of financial models and term versioning.
```

**Outcome / notes:**

- [ ] Offer converts to engagement
- [ ] Provider and client finances separate
- [ ] Terms versioned and immutable

---

## Step 14 — Milestones and deliverables

**Prompt:**

```
Read 04-engagement-work-execution.md and 18-integration-roadmap.md Step 14. Then inspect existing milestone, task, or deliverable patterns.

Build milestones and deliverables:
- Milestone definitions with acceptance criteria
- Deliverable upload and versioning
- Review and revision flows
- Approval tracking

Historical deliverables must not be overwritten. Approval must be auditable. Client review must be optional or configurable per engagement. Add tests for immutability and auditability.
```

**Outcome / notes:**

- [ ] Historical deliverables immutable
- [ ] Approval auditable
- [ ] Client review configurable

---

## Step 15 — Time tracking, timesheets, day rates, and retainers

**Prompt:**

```
Read 04-engagement-work-execution.md and 18-integration-roadmap.md Step 15. Then inspect existing time entry, timesheet, or billing-work patterns.

Build time and work recognition:
- Time entries
- Timesheets
- Day statements
- Retainer periods and utilization
- Approval flows

Different engagement models must use the correct work-recognition mechanism. Approved work must be able to become invoiceable. Day rates must not be represented as fake hourly entries. Add tests for each engagement model.
```

**Outcome / notes:**

- [ ] Correct mechanism per engagement model
- [ ] Approved work becomes invoiceable
- [ ] Day rates honest and clear

---

## Step 16 — Change requests and completion

**Prompt:**

```
Read 04-engagement-work-execution.md and 18-integration-roadmap.md Step 16. Then inspect existing change request or project close patterns.

Build change requests and completion:
- Change request creation and impact assessment
- Approval workflow
- Terms application
- Completion validation
- Closure and termination handling

Agreed terms must never mutate silently. Completion must be able to enforce outstanding requirements. Termination must handle unresolved work and finance states. Add tests for term immutability and termination edge cases.
```

**Outcome / notes:**

- [ ] Terms never silently mutate
- [ ] Completion enforces requirements
- [ ] Termination handles unresolved state

---

## Step 17 — Provider financial foundations

**Prompt:**

```
Read 05-billing-payments.md and 18-integration-roadmap.md Step 17. Then inspect existing invoice, billing, and finance patterns.

Build provider financial foundations:
- Provider compensation rules
- Invoiceable item tracking
- Provider tax profile
- Payout account model
- Provider invoice and invoice lines

Invoiceable items must not be double-invoiced. Provider invoices must not depend on client invoices. Currency must be explicit. Add tests for double-invoice prevention and currency handling.
```

**Outcome / notes:**

- [ ] No double invoicing
- [ ] Provider invoice independent of client invoice
- [ ] Currency explicit everywhere

---

## Step 18 — Provider invoice approval and payments

**Prompt:**

```
Read 05-billing-payments.md and 18-integration-roadmap.md Step 18. Then inspect existing approval and payment workflows.

Build provider invoice approval and payments:
- Provider invoice workflow with review, changes, and approval
- Payment scheduling
- Partial payment support
- Payment evidence handling
- Reconciliation state tracking

Issued and submitted historical documents must be preserved. Payment status must not be inferred solely from invoice status. Payout changes must be strongly audited. Add tests for state transitions and audit requirements.
```

**Outcome / notes:**

- [ ] Historical documents preserved
- [ ] Payment status independent
- [ ] Payout changes audited

---

## Step 19 — Client pricing and invoices

**Prompt:**

```
Read 05-billing-payments.md and 18-integration-roadmap.md Step 19. Then inspect existing client pricing and invoice patterns.

Build client pricing and invoices:
- Client pricing rules
- Billing schedules
- Client invoice and invoice lines
- Purchase order support
- Tax handling
- Credit notes

Client pricing must never leak provider cost. Issued invoices must be immutable. Provider invoice timing must not control client invoice timing. Add tests for leakage prevention and immutability.
```

**Outcome / notes:**

- [ ] No provider cost leakage
- [ ] Issued invoices immutable
- [ ] Client and provider billing independent

---

## Step 20 — Client payments and reconciliation

**Prompt:**

```
Read 05-billing-payments.md and 18-integration-roadmap.md Step 20. Then inspect existing payment and reconciliation patterns.

Build client payments and reconciliation:
- Client payment recording
- Partial and multi-invoice reconciliation
- Aging reports
- Receivable state tracking

Support partial and multi-invoice reconciliation. Receivable states must be correct. Add tests for reconciliation edge cases.
```

**Outcome / notes:**

- [ ] Partial/multi-invoice reconciliation works
- [ ] Receivable states correct

---

## Step 21 — Provider reputation and reviews

**Prompt:**

```
Read 06-reputation-trust-quality.md and 18-integration-roadmap.md Step 21. Then inspect existing review, rating, or reputation patterns.

Build reputation and reviews:
- Client review collection
- Internal evaluation tracking
- Performance snapshots
- Provider tier assignment
- Provider health scoring

Internal and external ratings must remain distinct. Historical reputation values must be preserved. Add tests for separation and historical integrity.
```

**Outcome / notes:**

- [ ] Internal and external ratings distinct
- [ ] Historical values preserved

---

## Step 22 — Verification lifecycle and trust operations

**Prompt:**

```
Read 06-reputation-trust-quality.md and 18-integration-roadmap.md Step 22. Then inspect existing trust, risk, or suspension patterns.

Build verification lifecycle:
- Expiry and revocation handling
- Risk signals and warnings
- Restrictions and suspension
- Offboarding
- Appeals process

Risk signals must not automatically punish providers unless explicitly configured. Suspension must preserve legally required access and history. Add tests for risk escalation and suspension behavior.
```

**Outcome / notes:**

- [ ] Risk signals configurable
- [ ] Suspension preserves access/history
- [ ] Appeals process available

---

## Step 23 — Incidents, complaints, and disputes

**Prompt:**

```
Read 06-reputation-trust-quality.md and 18-integration-roadmap.md Step 23. Then inspect existing incident, complaint, or dispute patterns.

Build three separate domains:
- Complaints
- Incidents
- Disputes

Each domain must remain semantically separate with references between them. Evidence and audit history must be preserved. Add tests that prove the domains do not collapse into each other.
```

**Outcome / notes:**

- [ ] Three distinct domains
- [ ] Evidence and audit preserved
- [ ] References between domains clear

---

## Step 24 — Provider portal foundation

**Prompt:**

```
Read 07-provider-portal-ux.md and 18-integration-roadmap.md Step 24. Then inspect existing portal, dashboard, and navigation patterns.

Build the provider portal foundation:
- Navigation structure
- Dashboard with key actions
- Action center showing outstanding items
- Notifications panel
- Common loading, error, and empty states

Providers must immediately see outstanding actions. The portal must work responsively. Reuse existing layout, theme, and component patterns. Add tests for responsive behavior and action-center correctness.
```

**Outcome / notes:**

- [ ] Outstanding actions visible immediately
- [ ] Responsive layout working
- [ ] Common states handled

---

## Step 25 — Provider operational pages

**Prompt:**

```
Read 07-provider-portal-ux.md and 18-integration-roadmap.md Step 25. Then inspect existing operational pages and data-fetch patterns.

Build provider operational pages:
- Opportunities list and detail
- Proposals list and detail
- Engagements list and detail
- Work queue
- Calendar and capacity view
- Services management
- Profile editing
- Documents
- Earnings overview
- Invoices
- Settings and support

All data displayed must be provider-safe. The cross-engagement work queue must be actionable. Follow existing data-fetch and caching patterns. Add tests for data-boundary enforcement.
```

**Outcome / notes:**

- [ ] All data provider-safe
- [ ] Work queue actionable
- [ ] Reuses existing patterns

---

## Step 26 — SDK operations portal

**Prompt:**

```
Read 08-sdk-admin-operations.md and 18-integration-roadmap.md Step 26. Then inspect existing admin, queue, and operations patterns.

Build the SDK operations portal:
- Operational queues
- Provider 360 view
- Client 360 view
- Project 360 view
- Opportunity operations
- Engagement operations
- Finance operations
- Trust operations
- Audit explorer
- Configuration screens

Operations must be queue and exception driven. Sensitive actions must honor capability permissions. Overrides must be audited. Add tests for permission boundaries and audit capture.
```

**Outcome / notes:**

- [ ] Queue-driven operations
- [ ] Sensitive actions permission-gated
- [ ] Overrides audited

---

## Step 27 — Client portal integration

**Prompt:**

```
Read 09-client-side-integration.md and 18-integration-roadmap.md Step 27. Then inspect the existing client portal structure.

Build client portal integration:
- Request intake flows
- Provider shortlist display
- Interview coordination
- Engagement approval workflows
- Client document access
- Client billing views
- Review submission

No provider cost or internal SDK data may leak to clients. Client involvement must be configurable per engagement and opportunity. Add tests for leakage prevention and configurability.
```

**Outcome / notes:**

- [ ] No provider cost leakage
- [ ] Client involvement configurable
- [ ] Existing client portal respected

---

## Step 28 — Notifications and communication hardening

**Prompt:**

```
Read 11-notifications-communications-documents.md and 18-integration-roadmap.md Step 28. Then inspect existing notification and communication patterns.

Build notifications and communications:
- Central notification routing
- User preferences
- Delivery retry logic
- Contextual message threads
- Templates
- Delivery monitoring

Duplicate event processing must not duplicate notifications. Internal and external message visibility must be enforced. Add tests for idempotency and visibility rules.
```

**Outcome / notes:**

- [ ] Duplicate events do not duplicate notifications
- [ ] Visibility enforced
- [ ] Retries handled

---

## Step 29 — External integrations

**Prompt:**

```
Read 12-integrations-api-events.md and 18-integration-roadmap.md Step 29. Then inspect existing integration and webhook patterns.

Build external integrations in this order:
1. Calendar
2. E-signature
3. Email
4. Accounting
5. Banking and reconciliation
6. Verification providers
7. Optional project-management and time tools

The core domain must work without any single external vendor. Sync failures must be visible and retryable. Do not couple the domain to a specific vendor. Add tests for failure visibility and retry behavior.
```

**Outcome / notes:**

- [ ] Core domain vendor-agnostic
- [ ] Sync failures visible and retryable
- [ ] Integrations ordered per plan

---

## Step 30 — Analytics and observability

**Prompt:**

```
Read 14-analytics-reporting-observability.md and 18-integration-roadmap.md Step 30. Then inspect existing analytics, reporting, and dashboard patterns.

Build analytics and observability:
- Provider and network metrics
- Opportunity funnel tracking
- Engagement health indicators
- Finance metrics
- Trust metrics
- Failure dashboards
- Backlog and stuck-state monitoring

Build on stable domain events and data. Do not build analytics before the underlying domains are stable. Add tests for metric accuracy and dashboard data correctness.
```

**Outcome / notes:**

- [ ] Metrics tied to stable events
- [ ] Dashboards accurate
- [ ] Stuck states visible

---

## Step 31 — Security and compliance hardening

**Prompt:**

```
Read 10-roles-permissions-security.md, 15-non-functional-testing-compliance.md, and 18-integration-roadmap.md Step 31. Then inspect existing security, permission, and compliance patterns.

Build security and compliance hardening:
- Permission test suite
- MFA or reauthentication for privileged actions
- Sensitive access logging
- Data export and deletion workflows
- Retention policies
- Rate limiting
- File security hardening

Cover all major domains. Add tests that prove permission boundaries, sensitive access logging, and data lifecycle rules work correctly.
```

**Outcome / notes:**

- [ ] Permission tests comprehensive
- [ ] Sensitive actions logged
- [ ] Data lifecycle enforced

---

## Step 32 — Pilot rollout

**Prompt:**

```
Read 16-rollout-migration-future.md and 18-integration-roadmap.md Step 32. Then inspect existing feature flag, rollout, and migration patterns.

Prepare pilot rollout:
- Feature flags for controlled exposure
- Pilot cohort selection
- Operational runbooks
- Support process
- Migration or backfill scripts if needed

A small provider and client cohort must be able to complete the full lifecycle end-to-end in a production-like environment. Financial and permission boundaries must be verified under real conditions. Add tests for feature flag behavior and migration safety.
```

**Outcome / notes:**

- [ ] Feature flags in place
- [ ] Pilot cohort can complete full lifecycle
- [ ] Boundaries verified in production-like conditions

---

## Step 33 — Matching V2 and advanced automation

**Prompt:**

```
Read 03-opportunities-matching-proposals.md and 18-integration-roadmap.md Step 33. Only proceed after enough real data exists from the pilot.

Build matching V2 and advanced automation:
- Semantic matching improvements
- Historical success prediction
- Capacity optimization
- AI-assisted opportunity drafting
- AI-assisted provider and profile enrichment
- Automated recommendation explanations

AI recommendations must remain explainable and operator-overridable. Do not replace the core matching engine; extend it. Add tests for explainability and override behavior.
```

**Outcome / notes:**

- [ ] Real data available from pilot
- [ ] AI recommendations explainable
- [ ] Operator overrides preserved

---

## Progress summary

| Step | Title                                               | Status  |
| ---- | --------------------------------------------------- | ------- |
| 1    | Domain foundations                                  | done    |
| 2    | Provider application                                | done    |
| 3    | Provider profile and skills                         | done    |
| 4    | Verification and commercial readiness               | done    |
| 5    | Availability and capacity                           | done    |
| 6    | Provider services catalogue                         | done    |
| 7    | Client requests and project intake                  | done    |
| 8    | Opportunity creation and lifecycle                  | done    |
| 9    | Matching engine V1                                  | done    |
| 10   | Invitations and opportunity browsing                | done    |
| 11   | Proposals                                           | pending |
| 12   | Shortlisting, interviews, and offers                | pending |
| 13   | Engagement core                                     | pending |
| 14   | Milestones and deliverables                         | pending |
| 15   | Time tracking, timesheets, day rates, and retainers | pending |
| 16   | Change requests and completion                      | pending |
| 17   | Provider financial foundations                      | pending |
| 18   | Provider invoice approval and payments              | pending |
| 19   | Client pricing and invoices                         | pending |
| 20   | Client payments and reconciliation                  | pending |
| 21   | Provider reputation and reviews                     | pending |
| 22   | Verification lifecycle and trust operations         | pending |
| 23   | Incidents, complaints, and disputes                 | pending |
| 24   | Provider portal foundation                          | pending |
| 25   | Provider operational pages                          | pending |
| 26   | SDK operations portal                               | pending |
| 27   | Client portal integration                           | pending |
| 28   | Notifications and communication hardening           | pending |
| 29   | External integrations                               | pending |
| 30   | Analytics and observability                         | pending |
| 31   | Security and compliance hardening                   | pending |
| 32   | Pilot rollout                                       | pending |
| 33   | Matching V2 and advanced automation                 | pending |
