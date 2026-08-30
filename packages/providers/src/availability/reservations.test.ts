import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  getReservations,
} from "@sdk-e/providers/availability/reservations";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const capacityReservation = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const providerWeeklyCapacity = { findMany: vi.fn() };
  const providerAbsence = { findMany: vi.fn() };
  const provider = { findFirst: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      capacityReservation,
      providerWeeklyCapacity,
      providerAbsence,
      provider,
      auditEvent,
      $transaction: vi.fn(),
    },
    capacityReservation,
    providerWeeklyCapacity,
    providerAbsence,
    provider,
    auditEvent,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

const monFri8h = [1, 2, 3, 4, 5].map((w) => ({ weekday: w, hoursPerDay: 8 }));

const baseReservation = {
  id: "res-1",
  providerId: "provider-1",
  engagementId: null,
  hoursPerDay: 4,
  startDate: new Date("2025-02-03"),
  endDate: new Date("2025-02-07"),
  status: "PENDING" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function setupProvider(timeZone = "America/New_York", defaultDailyHours: number | null = null) {
  mocks.provider.findFirst.mockResolvedValue({ id: "provider-1", timeZone, defaultDailyHours });
  mocks.providerWeeklyCapacity.findMany.mockResolvedValue(monFri8h);
  mocks.providerAbsence.findMany.mockResolvedValue([]);
  mocks.capacityReservation.findMany.mockResolvedValue([]);
}

beforeEach(() => {
  for (const mock of [
    mocks.capacityReservation.create,
    mocks.capacityReservation.findFirst,
    mocks.capacityReservation.findMany,
    mocks.capacityReservation.update,
    mocks.providerWeeklyCapacity.findMany,
    mocks.providerAbsence.findMany,
    mocks.provider.findFirst,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("createReservation", () => {
  it("creates a pending reservation when feasible", async () => {
    setupProvider();
    mocks.capacityReservation.create.mockResolvedValue(baseReservation);

    const result = await createReservation(principal("sdk-admin"), "provider-1", {
      hoursPerDay: 4,
      startDate: new Date("2025-02-03"),
      endDate: new Date("2025-02-07"),
    });

    expect(result.status).toBe("PENDING");
    expect(mocks.auditEvent.create).toHaveBeenCalled();
  });

  it("rejects reservation when capacity is exceeded", async () => {
    setupProvider();
    mocks.capacityReservation.findMany.mockResolvedValue([
      { ...baseReservation, hoursPerDay: 6, status: "CONFIRMED" },
    ]);
    await expect(
      createReservation(principal("sdk-admin"), "provider-1", {
        hoursPerDay: 6,
        startDate: new Date("2025-02-03"),
        endDate: new Date("2025-02-07"),
      })
    ).rejects.toThrow("not feasible");
  });

  it("rejects provider creating reservation", async () => {
    await expect(
      createReservation(principal("provider"), "provider-1", {
        hoursPerDay: 4,
        startDate: new Date("2025-02-03"),
        endDate: new Date("2025-02-07"),
      })
    ).rejects.toThrow();
  });
});

describe("confirmReservation", () => {
  it("confirms a pending reservation", async () => {
    setupProvider();
    mocks.capacityReservation.findFirst.mockResolvedValue(baseReservation);
    mocks.capacityReservation.findMany.mockResolvedValue([]);
    mocks.capacityReservation.update.mockResolvedValue({ ...baseReservation, status: "CONFIRMED" });
    const result = await confirmReservation(principal("sdk-admin"), "res-1");
    expect(result.status).toBe("CONFIRMED");
  });

  it("rejects confirming when capacity changed since pending", async () => {
    setupProvider();
    mocks.capacityReservation.findFirst.mockResolvedValue(baseReservation);
    mocks.capacityReservation.findMany.mockResolvedValue([
      { ...baseReservation, id: "res-other", hoursPerDay: 8, status: "CONFIRMED" },
    ]);
    await expect(confirmReservation(principal("sdk-admin"), "res-1")).rejects.toThrow(
      "capacity no longer available"
    );
  });

  it("rejects confirming non-pending reservation", async () => {
    mocks.capacityReservation.findFirst.mockResolvedValue({
      ...baseReservation,
      status: "CONFIRMED",
    });
    await expect(confirmReservation(principal("sdk-admin"), "res-1")).rejects.toThrow(
      "Cannot confirm reservation in CONFIRMED status"
    );
  });
});

describe("cancelReservation", () => {
  it("cancels a pending reservation", async () => {
    mocks.capacityReservation.findFirst.mockResolvedValue(baseReservation);
    mocks.capacityReservation.update.mockResolvedValue({ ...baseReservation, status: "CANCELLED" });

    const result = await cancelReservation(principal("sdk-admin"), "res-1");
    expect(result.status).toBe("CANCELLED");
  });

  it("cancels a confirmed reservation", async () => {
    mocks.capacityReservation.findFirst.mockResolvedValue({
      ...baseReservation,
      status: "CONFIRMED",
    });
    mocks.capacityReservation.update.mockResolvedValue({
      ...baseReservation,
      status: "CANCELLED",
    });

    const result = await cancelReservation(principal("sdk-admin"), "res-1");
    expect(result.status).toBe("CANCELLED");
  });

  it("blocks cancelling already cancelled reservation", async () => {
    mocks.capacityReservation.findFirst.mockResolvedValue({
      ...baseReservation,
      status: "CANCELLED",
    });

    await expect(cancelReservation(principal("sdk-admin"), "res-1")).rejects.toThrow(
      "already cancelled"
    );
  });
});

describe("getReservations", () => {
  it("returns reservations for the provider", async () => {
    mocks.capacityReservation.findMany.mockResolvedValue([baseReservation]);

    const result = await getReservations(principal("provider"), "provider-1");
    expect(result).toHaveLength(1);
  });

  it("SDK staff can view any provider reservations", async () => {
    mocks.capacityReservation.findMany.mockResolvedValue([baseReservation]);

    const result = await getReservations(principal("sdk-admin"), "provider-1");
    expect(result).toHaveLength(1);
  });
});
