import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWeeklyCapacity,
  upsertWeeklyCapacity,
  getDefaultDailyHours,
  setDefaultDailyHours,
  getCapacityRange,
} from "@sdk-e/providers/availability/availability";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerWeeklyCapacity = {
    findMany: vi.fn(),
    upsert: vi.fn(),
  };
  const providerAbsence = { findMany: vi.fn() };
  const capacityReservation = { findMany: vi.fn() };
  const provider = { findFirst: vi.fn(), update: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      providerWeeklyCapacity,
      providerAbsence,
      capacityReservation,
      provider,
      auditEvent,
      $transaction: vi.fn(),
    },
    providerWeeklyCapacity,
    providerAbsence,
    capacityReservation,
    provider,
    auditEvent,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  for (const mock of [
    mocks.providerWeeklyCapacity.findMany,
    mocks.providerWeeklyCapacity.upsert,
    mocks.providerAbsence.findMany,
    mocks.capacityReservation.findMany,
    mocks.provider.findFirst,
    mocks.provider.update,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
  mocks.prisma.$transaction.mockImplementation(
    async (callback: (tx: typeof mocks.prisma) => Promise<unknown>) => callback(mocks.prisma)
  );
});

describe("getWeeklyCapacity", () => {
  it("returns entries and provider timezone", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      timeZone: "America/New_York",
      defaultDailyHours: null,
    });
    mocks.providerWeeklyCapacity.findMany.mockResolvedValue([
      { weekday: 1, hoursPerDay: 8 },
      { weekday: 2, hoursPerDay: 8 },
    ]);

    const result = await getWeeklyCapacity(principal("provider"), "provider-1");
    expect(result.timeZone).toBe("America/New_York");
    expect(result.entries).toHaveLength(2);
  });
});

describe("upsertWeeklyCapacity", () => {
  it("upserts entries and logs audit event", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      timeZone: "America/New_York",
      defaultDailyHours: null,
    });
    mocks.providerWeeklyCapacity.findMany.mockResolvedValue([{ weekday: 1, hoursPerDay: 8 }]);
    mocks.providerAbsence.findMany.mockResolvedValue([]);
    mocks.capacityReservation.findMany.mockResolvedValue([]);

    await upsertWeeklyCapacity(principal("provider"), "provider-1", [
      { weekday: 1, hoursPerDay: 8 },
      { weekday: 2, hoursPerDay: 6 },
    ]);

    expect(mocks.providerWeeklyCapacity.upsert).toHaveBeenCalledTimes(2);
    expect(mocks.auditEvent.create).toHaveBeenCalled();
  });

  it("rejects when timezone is not set", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      timeZone: null,
      defaultDailyHours: null,
    });

    await expect(
      upsertWeeklyCapacity(principal("provider"), "provider-1", [{ weekday: 1, hoursPerDay: 8 }])
    ).rejects.toThrow("timezone must be set");
  });

  it("returns warnings when reservations exceed new capacity", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      timeZone: "America/New_York",
      defaultDailyHours: null,
    });
    mocks.providerWeeklyCapacity.findMany.mockResolvedValue(
      [1, 2, 3, 4, 5].map((w) => ({ weekday: w, hoursPerDay: 4 }))
    );

    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 - now.getDay() + 7) % 7 || 7));
    nextMonday.setUTCHours(0, 0, 0, 0);
    const nextFriday = new Date(nextMonday);
    nextFriday.setDate(nextMonday.getDate() + 4);

    mocks.capacityReservation.findMany.mockResolvedValue([
      {
        id: "res-1",
        engagementId: "eng-1",
        hoursPerDay: 8,
        startDate: nextMonday,
        endDate: nextFriday,
        status: "CONFIRMED",
      },
    ]);
    mocks.providerAbsence.findMany.mockResolvedValue([]);

    const result = await upsertWeeklyCapacity(
      principal("provider"),
      "provider-1",
      [1, 2, 3, 4, 5].map((w) => ({ weekday: w, hoursPerDay: 4 }))
    );

    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("getDefaultDailyHours", () => {
  it("returns the default daily hours", async () => {
    mocks.provider.findFirst.mockResolvedValue({ defaultDailyHours: 6 });
    const result = await getDefaultDailyHours(principal("provider"), "provider-1");
    expect(result).toBe(6);
  });
});

describe("setDefaultDailyHours", () => {
  it("updates default daily hours", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.provider.update.mockResolvedValue({ defaultDailyHours: 7 });
    const result = await setDefaultDailyHours(principal("provider"), "provider-1", 7);
    expect(result).toBe(7);
    expect(mocks.auditEvent.create).toHaveBeenCalled();
  });

  it("rejects hours outside 0-24 range", async () => {
    await expect(setDefaultDailyHours(principal("provider"), "provider-1", 25)).rejects.toThrow(
      "between 0 and 24"
    );
    await expect(setDefaultDailyHours(principal("provider"), "provider-1", -1)).rejects.toThrow(
      "between 0 and 24"
    );
  });
});

describe("getCapacityRange", () => {
  it("returns capacity for each week in range", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      timeZone: "America/New_York",
      defaultDailyHours: null,
    });
    mocks.providerWeeklyCapacity.findMany.mockResolvedValue([
      { weekday: 1, hoursPerDay: 8 },
      { weekday: 2, hoursPerDay: 8 },
      { weekday: 3, hoursPerDay: 8 },
      { weekday: 4, hoursPerDay: 8 },
      { weekday: 5, hoursPerDay: 8 },
    ]);
    mocks.providerAbsence.findMany.mockResolvedValue([]);
    mocks.capacityReservation.findMany.mockResolvedValue([]);

    const result = await getCapacityRange(
      principal("provider"),
      "provider-1",
      new Date("2025-02-03"),
      4
    );

    expect(result).toHaveLength(4);
    for (const week of result) {
      expect(week.base).toBe(40);
      expect(week.available).toBe(40);
    }
  });
});
