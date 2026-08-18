# Round 15 — Non-Functional Requirements, Testing & Compliance

## Performance

Provider/client dashboards should remain responsive even with substantial historical data.

Use pagination, indexed queries, asynchronous processing, and cached derived metrics where appropriate.

## Scalability

Design domain boundaries so provider count, opportunities, messages, invoices, and audit history can grow independently.

## Reliability

Critical workflows must tolerate retries without duplicate business effects.

## Data integrity

Use transactional boundaries for state changes that must be atomic.

## Accessibility

Core portals should meet WCAG-oriented accessibility standards appropriate for a professional application.

## Internationalization

Prepare user-facing copy, dates, numbers, currencies, and timezones for internationalization.

## Timezones

Display times in user/context timezone while preserving canonical stored timestamps.

## Privacy

Apply data minimization, access limitation, purpose-based retention, export/deletion workflows where legally applicable, and auditable sensitive-data access.

## GDPR-oriented capabilities

Support:

- Privacy notices
- Consent where required
- Data export
- Data correction
- Account closure
- Retention policies
- Deletion/anonymization policies where legally allowed
- Processing records/configuration as needed by SDK operations

Financial/legal records may require retention even after account closure.

## Testing strategy

### Unit tests

Domain rules, calculations, permissions, state transitions.

### Integration tests

Database transactions, external adapters, event handling.

### Contract tests

APIs and external integration contracts.

### End-to-end tests

Critical journeys:

- Provider applies and is approved
- Provider creates service and SDK approves
- Opportunity created and matched
- Provider invited and submits proposal
- Proposal selected and engagement created
- Provider submits work/timesheet
- Provider invoices SDK
- SDK records provider payment
- SDK issues client invoice
- Client payment recorded
- Provider reviewed/suspended/offboarded

### Permission tests

Explicit tests for data leakage across provider/client/SDK roles.

### Financial tests

Rounding, currency, taxes, duplicate invoicing, partial payments, reconciliation.

### State-machine tests

Valid and invalid transitions.

## Security testing

Include authorization, object-level access, rate limiting, file access, privilege escalation, payout changes, session security, and audit coverage.

## Migration testing

If existing users/projects/clients are migrated into the new domain, validate backfills and compatibility.

## Feature flags

Use flags for risky staged rollouts.

## Definition of done

A capability is not done unless it includes:

- Domain logic
- Authorization
- Validation
- Error states
- Audit coverage
- Notifications where required
- Tests
- Operational visibility
- Documentation
