# Round 3 — Opportunities, Matching & Proposals

## Opportunity creation

Support:

- SDK staff-created opportunities
- Client requests converted into opportunities
- Opportunities created by other internal workflows

## Visibility

Configurable per opportunity:

- Direct assignment
- Invite-only
- Eligible-provider network

Avoid a universal public job board.

## Opportunity data

Support:

- Title
- Description
- Client/industry information
- Required skills
- Preferred skills
- Seniority
- Engagement type
- Budget/rate range
- Duration
- Workload/capacity
- Start date
- Deadline/end date
- Location/timezone requirements
- Languages
- Deliverables/outcomes
- Attachments
- Provider questions
- Number of providers required
- Client identity visibility
- NDA/confidentiality
- Internal SDK notes

## Multi-role opportunities

A client project may contain multiple opportunity positions/roles.

Recommended structure:

`Project / Client Need → Opportunity → Position(s)`

## Matching inputs

Use:

- Skills
- Proficiency
- Verified skills
- Experience/seniority
- Availability
- Capacity
- Rate compatibility
- Location/timezone
- Language
- Reputation/quality
- Previous client experience
- Industry experience
- Past SDK engagements
- Provider preferences

## Matching model

Use:

- Hard eligibility filters
- Weighted ranking
- SDK-configurable weights
- Different matching rules by opportunity type

AI/semantic matching can be added later as an augmentation.

## Matching operator controls

Provide:

- Match score
- Match explanation
- Warnings
- Manual boost
- Manual suppress
- Exclusion
- Audit history

## Invitations

Providers may:

- Accept
- Decline
- Ask questions
- Submit proposal
- Suggest alternate rate/availability
- Allow invitation to expire

## Provider browsing

Support:

- Apply
- Save/bookmark
- Not interested
- Recommended opportunities
- Search/filter
- Alerts

## Proposal content

Support:

- Cover message
- Proposed rate
- Pricing model
- Estimated effort
- Start date
- Availability
- Completion estimate
- Milestones
- Opportunity question answers
- Relevant portfolio
- Attachments
- Assumptions
- Scope exclusions
- Valid-until date
- Alternative options

## Proposal negotiation

Support:

- SDK revision requests
- Provider revisions
- Version history
- SDK-proposed commercial changes
- Client comments via SDK-managed workflow
- Proposal message thread

Provider/client direct binding negotiation is not the default.

## Pricing visibility

Client sees SDK client-facing pricing.

SDK sees provider compensation, client pricing, and margin.

Provider sees provider compensation.

Allow engagement-specific visibility configuration only when explicitly authorized.

## Selection

Support:

- SDK shortlist
- Client interviews
- SDK selection with client approval
- Configurable selection workflow

## Interviews

Support:

- SDK/client interview requests
- Provider accept/reschedule
- Calendar integration
- Evaluation notes
- Interview stages

## Selection completion

Provider receives a final offer and explicitly accepts final terms.

On acceptance:

- Create engagement
- Generate required commercial documents
- Keep backup candidates until fully confirmed
- Notify unsuccessful candidates

## Opportunity states

`Draft → Ready → Matching → Open/Invite-only → Reviewing Proposals → Shortlisting → Selection → Pending Provider Acceptance → Filled → Closed`

Alternative states:

`On Hold / Cancelled / Expired`

## Proposal states

`Draft → Submitted → Under Review → Changes Requested → Revised → Shortlisted → Interview → Offer Pending → Accepted`

Alternative states:

`Declined / Withdrawn / Rejected / Expired`

## Rejection feedback

Store:

- Internal rejection reason
- Optional provider-facing feedback

## Notifications

Notify for:

- Recommended opportunity
- Invitation
- Invitation expiry
- Proposal confirmation
- Proposal state changes
- Revision request
- Interview request
- Offer
- Rejection/closure
- Material opportunity changes
- Cancellation

## Domain separation

`Matching != Selection != Proposal != Engagement`
