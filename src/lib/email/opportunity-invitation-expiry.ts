import { sendMessage } from "@/lib/email/transport";
import { siteConfig } from "@/lib/marketing/site";
import {
  renderOpportunityInvitationExpiryEmail,
  type OpportunityInvitationExpiryEmailProps,
} from "@/lib/notifications/email-templates";

export async function sendOpportunityInvitationExpiryNotification(
  props: OpportunityInvitationExpiryEmailProps & { to: string }
): Promise<boolean> {
  return sendMessage(
    {
      from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
      to: props.to,
      subject: `Invitation to ${props.opportunityTitle} has expired`,
      html: renderOpportunityInvitationExpiryEmail(props),
    },
    "opportunity invitation expiry email"
  );
}
