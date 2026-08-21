import { sendMessage } from "@/lib/email/transport";
import { siteConfig } from "@/lib/marketing/site";
import {
  renderOpportunityInvitationEmail,
  type OpportunityInvitationEmailProps,
} from "@/lib/notifications/email-templates";

export async function sendOpportunityInvitationNotification(
  props: OpportunityInvitationEmailProps & { to: string }
): Promise<boolean> {
  return sendMessage(
    {
      from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
      to: props.to,
      subject: `Invitation to ${props.opportunityTitle}`,
      html: renderOpportunityInvitationEmail(props),
    },
    "opportunity invitation email"
  );
}
