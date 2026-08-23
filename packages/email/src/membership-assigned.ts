import { escapeHtml, sendMessage } from "@sdk-e/email/transport";
import { siteConfig } from "@sdk-e/config/site";

export interface MembershipAssignedNotification {
  to: string;
  recipientName: string;
  companyName: string;
  role: string;
}

const from = `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`;

export async function sendMembershipAssignedNotification(
  notification: MembershipAssignedNotification
): Promise<boolean> {
  const html = [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    `<h2>You now have access to ${escapeHtml(notification.companyName)}</h2>`,
    `<p>${escapeHtml(notification.recipientName)}, an SDK Enterprises administrator added you to ${escapeHtml(notification.companyName)} with ${escapeHtml(notification.role)} access.</p>`,
    "<p>Sign in to the SDK portal to get started.</p>",
    "</div>",
  ].join("\n");
  return sendMessage(
    {
      from,
      to: notification.to,
      subject: `You now have access to ${notification.companyName}`,
      html,
    },
    "membership assignment email"
  );
}
