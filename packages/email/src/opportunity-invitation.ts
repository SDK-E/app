import { sendMessage } from "@sdk-e/email/transport";
import { siteConfig } from "@sdk-e/config/site";
import {
  renderOpportunityInvitationEmail,
  type OpportunityInvitationEmailProps,
} from "./opportunity-invitation-emails";

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
