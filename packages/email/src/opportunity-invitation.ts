import { siteConfig } from "@platform/config/site";
import { sendMessage } from "@platform/email/transport";

import {
  type OpportunityInvitationEmailProps,
  renderOpportunityInvitationEmail,
} from "./opportunity-invitation-emails";

export async function sendOpportunityInvitationNotification(
  props: { to: string } & OpportunityInvitationEmailProps,
): Promise<boolean> {
  return sendMessage(
    {
      from: `SDK Enterprises <no-reply@${siteConfig.contact.domain}>`,
      to: props.to,
      subject: `Invitation to ${props.opportunityTitle}`,
      html: renderOpportunityInvitationEmail(props),
    },
    "opportunity invitation email",
  );
}
