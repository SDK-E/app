import { sendMessage } from "@sdk-e/email/transport";
import { siteConfig } from "@sdk-e/config/site";
import {
  renderOpportunityInvitationExpiryEmail,
  type OpportunityInvitationExpiryEmailProps,
} from "./opportunity-invitation-emails";

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
