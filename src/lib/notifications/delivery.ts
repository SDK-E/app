import { getPrisma } from "@/lib/db";
import type { Notification, NotificationDelivery } from "@/generated/prisma/client";

import { createNotificationDelivery } from "./notifications";
import { sendOpportunityInvitationNotification } from "@/lib/email/opportunity-invitation";
import { sendOpportunityInvitationExpiryNotification } from "@/lib/email/opportunity-invitation-expiry";

export async function deliverInApp(notification: Notification): Promise<NotificationDelivery> {
  return createNotificationDelivery(notification.id, "IN_APP");
}

export async function deliverEmail(notification: Notification): Promise<boolean> {
  const delivery = await createNotificationDelivery(notification.id, "EMAIL");
  const data = (notification.data ?? {}) as Record<string, unknown>;

  let sent = false;
  try {
    if (notification.type === "OPPORTUNITY_INVITATION_SENT") {
      sent = await sendOpportunityInvitationNotification({
        to: String(data.to ?? ""),
        providerName: String(data.providerName ?? ""),
        opportunityTitle: String(data.opportunityTitle ?? ""),
        acceptUrl: String(data.acceptUrl ?? ""),
        expiresAt: data.expiresAt ? new Date(data.expiresAt as string) : new Date(),
      });
    } else if (notification.type === "OPPORTUNITY_INVITATION_EXPIRED") {
      sent = await sendOpportunityInvitationExpiryNotification({
        to: String(data.to ?? ""),
        providerName: String(data.providerName ?? ""),
        opportunityTitle: String(data.opportunityTitle ?? ""),
      });
    }
  } catch {
    sent = false;
  }

  await getPrisma().notificationDelivery.update({
    where: { id: delivery.id },
    data: sent
      ? {
          status: "SENT",
          sentAt: new Date(),
          deliveredAt: new Date(),
          attempts: { increment: 1 },
        }
      : {
          status: "FAILED",
          failedAt: new Date(),
          attempts: { increment: 1 },
        },
  });

  return sent;
}

export async function deliver(notification: Notification): Promise<{
  inApp: NotificationDelivery;
  email: boolean;
}> {
  const inApp = await deliverInApp(notification);
  const email = await deliverEmail(notification);
  return { inApp, email };
}
