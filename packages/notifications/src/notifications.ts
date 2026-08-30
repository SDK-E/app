import { notFound } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { Prisma } from "@sdk-e/db/client";
import type {
  Notification,
  NotificationCategory,
  NotificationChannel,
  NotificationDelivery,
  NotificationType,
} from "@sdk-e/db/client";

export interface CreateNotificationInput {
  recipientId: string;
  recipientKind: string;
  category: NotificationCategory;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Prisma.InputJsonValue;
  eventKey: string;
}

export interface NotificationPageOptions {
  take?: number;
  skip?: number;
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  take: number;
  skip: number;
}

export async function createNotificationIdempotent(
  input: CreateNotificationInput
): Promise<Notification | null> {
  try {
    return await getPrisma().notification.create({
      data: {
        recipientId: input.recipientId,
        recipientKind: input.recipientKind,
        category: input.category,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
        eventKey: input.eventKey,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}

export async function getNotificationsForRecipient(
  recipientId: string,
  options: NotificationPageOptions = {}
): Promise<NotificationPage> {
  const take = Math.min(Math.max(options.take ?? 20, 1), 100);
  const skip = Math.max(options.skip ?? 0, 0);

  const [items, total] = await Promise.all([
    getPrisma().notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    getPrisma().notification.count({ where: { recipientId } }),
  ]);

  return { items, total, take, skip };
}

export async function markNotificationRead(
  notificationId: string,
  recipientId: string
): Promise<Notification> {
  try {
    return await getPrisma().notification.update({
      where: { id: notificationId, recipientId },
      data: { readAt: new Date() },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      notFound("Notification not found.");
    }
    throw error;
  }
}

export async function createNotificationDelivery(
  notificationId: string,
  channel: NotificationChannel
): Promise<NotificationDelivery> {
  try {
    return await getPrisma().notificationDelivery.create({
      data: {
        notificationId,
        channel,
        status: "PENDING",
        attempts: 0,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await getPrisma().notificationDelivery.findFirstOrThrow({
        where: { notificationId, channel },
      });
      return existing;
    }
    throw error;
  }
}
