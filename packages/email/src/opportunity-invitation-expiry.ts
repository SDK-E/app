import { siteConfig } from "@platform/config/site";
import { sendMessage } from "@platform/email/transport";

import {
  type OpportunityInvitationExpiryEmailProps,
  renderOpportunityInvitationExpiryEmail,
} from "./opportunity-invitation-emails";

export async function sendOpportunityInvitationExpiryNotification(
  props: { to: string } & OpportunityInvitationExpiryEmailProps,
): Promise<boolean> {
  return sendMessage(
    {
      from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
      to: props.to,
      subject: `Invitation to ${props.opportunityTitle} has expired`,
      html: renderOpportunityInvitationExpiryEmail(props),
    },
    "opportunity invitation expiry email",
  );
}
