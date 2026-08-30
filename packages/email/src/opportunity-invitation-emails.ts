import { escapeHtml } from "@platform/email/transport";

export interface OpportunityInvitationEmailProps {
  providerName: string;
  opportunityTitle: string;
  acceptUrl: string;
  expiresAt: Date;
}

export interface OpportunityInvitationExpiryEmailProps {
  providerName: string;
  opportunityTitle: string;
}

export function renderOpportunityInvitationEmail(props: OpportunityInvitationEmailProps): string {
  return [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    `<h2>You have been invited to an opportunity</h2>`,
    `<p>${escapeHtml(props.providerName)}, you have been invited to the opportunity <strong>${escapeHtml(props.opportunityTitle)}</strong>.</p>`,
    `<p><a href="${escapeHtml(props.acceptUrl)}">Review and accept the invitation</a></p>`,
    `<p>This invitation expires ${escapeHtml(props.expiresAt.toISOString())}.</p>`,
    "</div>",
  ].join("\n");
}

export function renderOpportunityInvitationExpiryEmail(
  props: OpportunityInvitationExpiryEmailProps,
): string {
  return [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    `<h2>An opportunity invitation has expired</h2>`,
    `<p>${escapeHtml(props.providerName)}, your invitation to the opportunity <strong>${escapeHtml(props.opportunityTitle)}</strong> has expired.</p>`,
    "</div>",
  ].join("\n");
}
