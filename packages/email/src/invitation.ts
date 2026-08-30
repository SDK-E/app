import { escapeHtml, sendMessage } from "@sdk-e/email/transport";
import { siteConfig } from "@sdk-e/config/site";

export interface InvitationNotification {
  email: string;
  inviterName: string;
  destination: string;
  role: string;
  acceptUrl: string;
  expiresAt: Date;
}

function renderInvitationHtml(invitation: InvitationNotification): string {
  return [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    "<h2>You have been invited to SDK Enterprises</h2>",
    `<p>${escapeHtml(invitation.inviterName)} invited you to ${escapeHtml(invitation.destination)} as ${escapeHtml(invitation.role)}.</p>`,
    `<p><a href="${escapeHtml(invitation.acceptUrl)}">Review and accept the invitation</a></p>`,
    `<p>This single-use link expires ${escapeHtml(invitation.expiresAt.toISOString())}.</p>`,
    "</div>",
  ].join("\n");
}

export async function sendInvitationNotification(
  invitation: InvitationNotification
): Promise<boolean> {
  return sendMessage(
    {
      from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
      to: invitation.email,
      subject: `Invitation to ${invitation.destination}`,
      html: renderInvitationHtml(invitation),
    },
    "invitation email"
  );
}
