import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@sdk-e/db/client";

import {
  createNotificationDelivery,
  createNotificationIdempotent,
  getNotificationsForRecipient,
  markNotificationRead,
} from "@sdk-e/notifications";

function p2002() {
  return new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "7.9.1",
  });
}

function p2025() {
  return new Prisma.PrismaClientKnownRequestError("not found", {
    code: "P2025",
    clientVersion: "7.9.1",
  });
}

const mocks = vi.hoisted(() => {
  const notifications: Record<string, unknown>[] = [];
  const deliveries: Record<string, unknown>[] = [];
  return { notifications, deliveries };
});

const prisma = vi.hoisted(() => {
  return {
    notification: {
      create: vi.fn(async (args) => {
        if (
          mocks.notifications.some(
            (n) => n.eventKey === args.data.eventKey && n.recipientId === args.data.recipientId
          )
        ) {
          throw p2002();
        }
        const created = { id: `n-${mocks.notifications.length + 1}`, ...args.data };
        mocks.notifications.push(created);
        return created;
      }),
      count: vi.fn(async (args) => {
        return mocks.notifications.filter((n) => n.recipientId === args.where.recipientId).length;
      }),
      findMany: vi.fn(async (args) => {
        const all = mocks.notifications
          .filter((n) => n.recipientId === args.where.recipientId)
          .sort((a, b) => (b.createdAt as string).localeCompare(a.createdAt as string));
        const start = args.skip ?? 0;
        return all.slice(start, start + (args.take ?? 20));
      }),
      update: vi.fn(async (args) => {
        const found = mocks.notifications.find(
          (n) => n.id === args.where.id && n.recipientId === args.where.recipientId
        );
        if (!found) throw p2025();
        Object.assign(found, args.data);
        return found;
      }),
    },
    notificationDelivery: {
      create: vi.fn(async (args) => {
        const dup = mocks.deliveries.find(
          (d) => d.notificationId === args.data.notificationId && d.channel === args.data.channel
        );
        if (dup) throw p2002();
        const created = { id: `d-${mocks.deliveries.length + 1}`, ...args.data };
        mocks.deliveries.push(created);
        return created;
      }),
      findFirstOrThrow: vi.fn(async (args) => {
        const found = mocks.deliveries.find(
          (d) => d.notificationId === args.where.notificationId && d.channel === args.where.channel
        );
        if (!found) throw p2025();
        return found;
      }),
    },
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => prisma }));

const baseInput = {
  recipientId: "recipient-1",
  recipientKind: "PROVIDER",
  category: "INVITATION" as const,
  type: "OPPORTUNITY_INVITATION_SENT" as const,
  title: "You have an invitation",
  eventKey: "invite-opp-1-provider-1",
};

describe("createNotificationIdempotent", () => {
  beforeEach(() => {
    mocks.notifications.length = 0;
    mocks.deliveries.length = 0;
    vi.clearAllMocks();
  });

  it("creates a notification on the first call", async () => {
    const result = await createNotificationIdempotent(baseInput);
    expect(result).not.toBeNull();
    expect(result?.eventKey).toBe(baseInput.eventKey);
    expect(mocks.notifications).toHaveLength(1);
  });

  it("returns null on a duplicate eventKey for the same recipient", async () => {
    await createNotificationIdempotent(baseInput);
    const result = await createNotificationIdempotent(baseInput);
    expect(result).toBeNull();
    expect(mocks.notifications).toHaveLength(1);
  });

  it("allows the same eventKey for a different recipient", async () => {
    await createNotificationIdempotent(baseInput);
    const result = await createNotificationIdempotent({ ...baseInput, recipientId: "recipient-2" });
    expect(result).not.toBeNull();
    expect(mocks.notifications).toHaveLength(2);
  });
});

describe("createNotificationDelivery", () => {
  beforeEach(() => {
    mocks.notifications.length = 0;
    mocks.deliveries.length = 0;
    vi.clearAllMocks();
  });

  it("creates a delivery for a notification + channel pair", async () => {
    const delivery = await createNotificationDelivery("n-1", "EMAIL");
    expect(delivery.notificationId).toBe("n-1");
    expect(delivery.channel).toBe("EMAIL");
    expect(mocks.deliveries).toHaveLength(1);
  });

  it("is idempotent per [notificationId, channel]", async () => {
    const first = await createNotificationDelivery("n-1", "EMAIL");
    const second = await createNotificationDelivery("n-1", "EMAIL");
    expect(second.id).toBe(first.id);
    expect(mocks.deliveries).toHaveLength(1);
  });

  it("allows a second channel for the same notification", async () => {
    await createNotificationDelivery("n-1", "EMAIL");
    const inApp = await createNotificationDelivery("n-1", "IN_APP");
    expect(inApp.channel).toBe("IN_APP");
    expect(mocks.deliveries).toHaveLength(2);
  });
});

describe("markNotificationRead", () => {
  beforeEach(() => {
    mocks.notifications.length = 0;
    mocks.deliveries.length = 0;
    vi.clearAllMocks();
    mocks.notifications.push({ id: "n-1", recipientId: "recipient-1", readAt: null });
  });

  it("sets readAt", async () => {
    const result = await markNotificationRead("n-1", "recipient-1");
    expect(result.readAt).toBeInstanceOf(Date);
  });

  it("throws notFound when the notification is missing or owned by another recipient", async () => {
    await expect(markNotificationRead("n-1", "other")).rejects.toThrow();
  });
});

describe("getNotificationsForRecipient", () => {
  beforeEach(() => {
    mocks.notifications.length = 0;
    mocks.deliveries.length = 0;
    vi.clearAllMocks();
    for (let i = 0; i < 5; i++) {
      mocks.notifications.push({
        id: `n-${i}`,
        recipientId: "recipient-1",
        createdAt: `2026-08-${String(20 - i).padStart(2, "0")}T00:00:00.000Z`,
      });
    }
  });

  it("returns a paginated page", async () => {
    const page = await getNotificationsForRecipient("recipient-1", { take: 2, skip: 0 });
    expect(page.items).toHaveLength(2);
    expect(page.total).toBe(5);
    expect(page.items[0].id).toBe("n-0");
  });

  it("respects skip", async () => {
    const page = await getNotificationsForRecipient("recipient-1", { take: 2, skip: 2 });
    expect(page.items).toHaveLength(2);
    expect(page.items[0].id).toBe("n-2");
  });
});
