# Round 10 — Roles, Permissions & Security

## Authorization principle

Use explicit capability-based authorization.

Do not rely only on route-level hiding or a single `admin` boolean.

## Actor groups

### Provider

Own provider profile, applications, services, proposals, engagements, work, provider invoices, payout configuration.

### Client

Access only client-authorized organization/project/provider/engagement/billing information.

### SDK Provider Operations

Manage provider lifecycle and service moderation.

### SDK Delivery / Project

Manage opportunities, selection, engagements, work approvals.

### SDK Finance

Manage provider invoices/payments, client invoices/payments, reconciliation, tax/accounting operations.

### SDK Compliance

Manage verification, compliance reviews, certain trust actions.

### SDK Support

Access support-relevant records with restricted sensitive fields.

### SDK Administrator

Configuration and privileged overrides.

## Resource-level authorization

Permissions must consider:

- Actor
- Organization
- Provider ownership
- Client ownership
- Project membership
- Engagement membership
- Record visibility
- Internal/external classification
- Financial sensitivity
- Compliance sensitivity
- Record state

## Sensitive data classes

At minimum:

- Public/client-visible profile data
- Provider-private data
- Client-private data
- SDK-internal data
- SDK-finance data
- SDK-compliance data
- Security-sensitive data

## Financial isolation

Enforce server-side:

- Provider cannot access client price unless explicitly allowed.
- Client cannot access provider compensation.
- Neither client nor provider can access SDK margin.
- Internal finance notes are SDK-only.

## Internal notes

Internal notes must never share storage/serialization paths with external comments in a way that risks accidental exposure.

## Payout data

Treat bank/payment information as highly sensitive.

Require strong authorization and change auditing.

## Authentication/security features

Support:

- Secure sessions
- MFA for privileged users
- Re-authentication for sensitive actions
- Session revocation
- Device/session management
- Passwordless/SSO where supported by application architecture
- Rate limiting
- Brute-force protection

## Privileged actions

Require stronger controls for:

- Payout detail changes
- Financial overrides
- Tax configuration
- Role changes
- Suspension/offboarding
- Invoice voiding/crediting
- Manual payment marking
- Audit export
- Security configuration

## Audit

Security-relevant actions must be auditable.

## Data export

Exports must obey the same permissions as interactive views.

## File security

Use access-controlled file delivery, malware scanning where applicable, limited signed URLs, and permission checks at request time.

## API security

Every API operation must enforce authorization independently of UI behavior.

## Tenancy

If the application is multi-tenant, all provider/client/project/financial queries must explicitly respect tenant/org boundaries.

## Security invariant

A hidden UI field is not a security control.
