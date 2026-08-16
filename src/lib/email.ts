import { getServerEnv } from "@/lib/env";
import { siteConfig } from "@/lib/siteConfig";

export interface EnquiryNotification {
  companyName: string;
  email: string;
  website?: string | null;
  capability: string;
  description: string;
  environment?: string | null;
  timeline?: string | null;
  budgetRange?: string | null;
  context?: string | null;
}

export interface InvitationNotification {
  email: string;
  inviterName: string;
  destination: string;
  role: string;
  acceptUrl: string;
  expiresAt: Date;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEnquiryHtml(enquiry: EnquiryNotification): string {
  const rows: Array<[string, string]> = [];
  const push = (label: string, value?: string | null) => {
    if (value) rows.push([label, value]);
  };
  push("Company", enquiry.companyName);
  push("Email", enquiry.email);
  push("Website", enquiry.website);
  push("Capability", enquiry.capability);
  push("Description", enquiry.description);
  push("Existing environment", enquiry.environment);
  push("Timeline", enquiry.timeline);
  push("Budget range", enquiry.budgetRange);
  push("Supporting context", enquiry.context);

  const body = rows
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");

  return [
    '<div style="font-family: sans-serif; line-height: 1.5; color: #111;">',
    "<h2>New project enquiry</h2>",
    body,
    "</div>",
  ].join("\n");
}

function subjectFor(enquiry: EnquiryNotification): string {
  const company = enquiry.companyName.replace(/\s+/g, " ").trim();
  return `New project enquiry — ${company}`;
}

async function sendViaResend(enquiry: EnquiryNotification): Promise<boolean> {
  const apiKey = getServerEnv().RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "enquiry email: RESEND_API_KEY not set — enquiry stored without email notification",
    );
    return false;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
    to: [siteConfig.contact.email],
    subject: subjectFor(enquiry),
    html: renderEnquiryHtml(enquiry),
  });
  if (error) {
    console.error("enquiry email: resend send failed", error.name, error.message);
    return false;
  }
  console.log("enquiry email: sent via Resend", data?.id);
  return true;
}

async function sendViaLocalSmtp(enquiry: EnquiryNotification): Promise<boolean> {
  const smtpUrl = getServerEnv().MAIL_SMTP_URL ?? "smtp://localhost:1025";
  const { createTransport } = await import("nodemailer");
  const transport = createTransport(smtpUrl);
  try {
    const info = await transport.sendMail({
      from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
      to: siteConfig.contact.email,
      subject: subjectFor(enquiry),
      html: renderEnquiryHtml(enquiry),
    });
    console.log("enquiry email: sent to local mail server", info.messageId, `(${smtpUrl})`);
    return true;
  } catch (err) {
    console.error(
      "enquiry email: local mail sink unreachable — it auto-starts with `npm run dev` (or run `npm run mail`)",
      err instanceof Error ? err.message : err,
    );
    return false;
  } finally {
    transport.close();
  }
}

export async function sendEnquiryNotification(
  enquiry: EnquiryNotification,
): Promise<boolean> {
  if (getServerEnv().NODE_ENV === "production") {
    return sendViaResend(enquiry);
  }
  return sendViaLocalSmtp(enquiry);
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

export async function sendInvitationNotification(invitation: InvitationNotification): Promise<boolean> {
  const message = {
    from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
    to: invitation.email,
    subject: `Invitation to ${invitation.destination}`,
    html: renderInvitationHtml(invitation),
  };
  if (getServerEnv().NODE_ENV !== "production") {
    const smtpUrl = getServerEnv().MAIL_SMTP_URL ?? "smtp://localhost:1025";
    const { createTransport } = await import("nodemailer");
    const transport = createTransport(smtpUrl);
    try {
      await transport.sendMail(message);
      return true;
    } catch (error) {
      console.error("invitation email: local mail sink unreachable", error instanceof Error ? error.message : "unknown error");
      return false;
    } finally {
      transport.close();
    }
  }
  const apiKey = getServerEnv().RESEND_API_KEY;
  if (!apiKey) {
    console.error("invitation email: RESEND_API_KEY not set");
    return false;
  }
  const { Resend } = await import("resend");
  const { data, error } = await new Resend(apiKey).emails.send(message);
  if (error) {
    console.error("invitation email: resend send failed", error.name, error.message);
    return false;
  }
  console.log("invitation email: accepted by Resend", data?.id);
  return true;
}
