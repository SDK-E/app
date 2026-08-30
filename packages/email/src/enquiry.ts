import { siteConfig } from "@platform/config/site";
import { escapeHtml, sendMessage } from "@platform/email/transport";

export interface EnquiryNotification {
  companyName: string;
  email: string;
  website?: null | string;
  capability: string;
  description: string;
  environment?: null | string;
  timeline?: null | string;
  budgetRange?: null | string;
  context?: null | string;
}

const from = `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`;

export async function sendEnquiryNotification(enquiry: EnquiryNotification): Promise<boolean> {
  const company = enquiry.companyName.replace(/\s+/g, " ").trim();
  return sendMessage(
    {
      from,
      to: siteConfig.contact.email,
      subject: `New project enquiry — ${company}`,
      html: renderEnquiryHtml(enquiry),
    },
    "enquiry email",
  );
}

function renderEnquiryHtml(enquiry: EnquiryNotification): string {
  const rows: [string, string][] = [];
  const push = (label: string, value?: null | string) => {
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
