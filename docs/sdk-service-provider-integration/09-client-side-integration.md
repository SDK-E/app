# Round 9 — Client-Side Integration

## Goal

Integrate the provider network into the existing client experience without exposing internal provider economics or SDK operational data.

## Client request intake

Clients can submit a structured request containing:

- Need/title
- Description
- Desired outcomes
- Required skills
- Preferred skills
- Seniority
- Start date
- Duration
- Expected workload
- Location/timezone
- Language
- Budget context where appropriate
- Attachments
- Confidentiality requirements
- Preferred engagement model

A client request does not automatically become a provider-visible opportunity.

SDK reviews/converts it first.

## Provider discovery

Authenticated clients may browse approved client-visible providers.

Support:

- Search
- Filters
- Skills
- Verified skills
- Availability indicator
- Languages
- Relevant experience
- Selected badges
- Client-visible rating

Do not expose:

- Provider cost
- Provider expected compensation
- SDK margin
- Internal tier
- Risk score
- Internal notes
- Private reviews

## Client shortlist

SDK can expose a curated shortlist to the client.

Client can:

- Review provider profile
- Review relevant portfolio
- Request interview
- Approve/reject candidate
- Leave structured feedback

## Interviews

Client interview workflow should remain associated with the opportunity/selection process.

## Client engagement workspace

Client-facing engagement pages may include:

- Provider(s)
- Scope
- Dates
- Milestones
- Deliverables
- Client approvals
- Timesheets where configured
- Change requests
- Documents
- Messages
- Client-facing financials
- Invoice status

## Client approvals

Configurable client approval for:

- Provider selection
- Milestones
- Deliverables
- Timesheets
- Change requests
- Completion

SDK can remain the final operational controller.

## Client financial boundary

Client sees:

- Client price
- Client invoices
- Client payment status
- Purchase orders
- Client-billable expenses

Client never sees:

- Provider compensation
- Provider invoices
- SDK margin
- Internal financial notes

## Client reviews

Eligible clients may review providers after meaningful work.

## Client notifications

Notify on:

- Candidate shortlist
- Interview request/changes
- Provider selected
- Engagement ready
- Deliverable submitted
- Approval required
- Change request
- Completion
- Invoice issued
- Payment reminder where appropriate

## Client roles

Support client organization permissions such as:

- Organization Admin
- Project Owner
- Approver
- Finance/Billing
- Viewer

## Client portal principle

The provider network should feel like part of SDK's managed service, not like the client has been dropped into an uncontrolled marketplace.
