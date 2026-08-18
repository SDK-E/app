import { escapeHtml, sendMessage } from "@/lib/email/transport";
import { siteConfig } from "@/lib/marketing/site";

export interface AccessRequestCreatedNotification {
  to: string;
  recipientName: string;
  companyName: string;
  requesterName: string;
  requesterEmail: string;
}

export interface AccessRequestResolvedNotification {
  to: string;
  recipientName: string;
  companyName: string;
  outcome: "APPROVED" | "DECLINED";
  role?: string;
}

const from = `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`;

export async function sendAccessRequestCreatedNotification(
  notification: AccessRequestCreatedNotification
): Promise<boolean> {
  const html = [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    `<h2>Access request for ${escapeHtml(notification.companyName)}</h2>`,
    `<p>${escapeHtml(notification.requesterName)} (${escapeHtml(notification.requesterEmail)}) requested access to ${escapeHtml(notification.companyName)} using its company access code.</p>`,
    "<p>Review the request and approve or decline it in the SDK portal.</p>",
    "</div>",
  ].join("\n");
  return sendMessage(
    {
      from,
      to: notification.to,
      subject: `Access request for ${notification.companyName}`,
      html,
    },
    "access request email"
  );
}

export async function sendAccessRequestResolvedNotification(
  notification: AccessRequestResolvedNotification
): Promise<boolean> {
  const outcome =
    notification.outcome === "APPROVED"
      ? `Your access request to ${escapeHtml(notification.companyName)} was approved. You now have ${escapeHtml(notification.role ?? "viewer")} access.`
      : `Your access request to ${escapeHtml(notification.companyName)} was declined.`;
  const html = [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    `<h2>Access request ${notification.outcome === "APPROVED" ? "approved" : "declined"}</h2>`,
    `<p>${outcome}</p>`,
    "</div>",
  ].join("\n");
  return sendMessage(
    {
      from,
      to: notification.to,
      subject: `Access request ${notification.outcome === "APPROVED" ? "approved" : "declined"} for ${notification.companyName}`,
      html,
    },
    "access request email"
  );
}
