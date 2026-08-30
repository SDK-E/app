import {
  calculateAvailableCapacity,
  calculateCapacityRange,
  checkReservationFeasibility,
} from "@platform/providers/availability/capacity";
import { describe, expect, it } from "vitest";

import { absence, MON_FRI_8H, reservation } from "./test-utils";

describe("calculateAvailableCapacity", () => {
  it("returns full capacity with no absences or reservations", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(weekStart, MON_FRI_8H, [], [], null);
    expect(result.base).toBe(40);
    expect(result.absenceHours).toBe(0);
    expect(result.confirmedReservationHours).toBe(0);
    expect(result.pendingReservationHours).toBe(0);
    expect(result.available).toBe(40);
  });

  it("subtracts absence and confirmed reservation correctly", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(
      weekStart,
      MON_FRI_8H,
      [absence("2025-01-15", "2025-01-17")],
      [reservation(4, "2025-01-13", "2025-01-14")],
      null,
    );
    expect(result.base).toBe(40);
    expect(result.absenceHours).toBe(24);
    expect(result.confirmedReservationHours).toBe(8);
    expect(result.available).toBe(8);
  });

  it("pending reservations appear in pendingReservationHours but not in available", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(
      weekStart,
      MON_FRI_8H,
      [],
      [reservation(4, "2025-01-13", "2025-01-17", "PENDING")],
      null,
    );
    expect(result.pendingReservationHours).toBe(20);
    expect(result.available).toBe(40);
  });

  it("zero capacity when no entries and no default", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(weekStart, [], [], [], null);
    expect(result.base).toBe(0);
    expect(result.available).toBe(0);
  });

  it("defaults to 0 available when capacity is fully consumed", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(
      weekStart,
      MON_FRI_8H,
      [absence("2025-01-13", "2025-01-17")],
      [],
      null,
    );
    expect(result.available).toBe(0);
  });
});

describe("calculateCapacityRange", () => {
  it("returns correct per-week breakdown for 2 weeks", () => {
    const results = calculateCapacityRange(
      new Date("2025-01-12T00:00:00Z"),
      2,
      MON_FRI_8H,
      [],
      [],
      null,
    );
    expect(results).toHaveLength(2);
    expect(results[0].base).toBe(40);
    expect(results[1].base).toBe(40);
  });
});

describe("checkReservationFeasibility", () => {
  it("returns feasible when capacity is sufficient", () => {
    const result = checkReservationFeasibility(
      4,
      new Date("2025-01-13"),
      new Date("2025-01-17"),
      MON_FRI_8H,
      [],
      [],
      null,
    );
    expect(result.feasible).toBe(true);
    expect(result.conflictingWeeks).toHaveLength(0);
  });

  it("returns not feasible when capacity is exceeded", () => {
    const result = checkReservationFeasibility(
      10,
      new Date("2025-01-13"),
      new Date("2025-01-17"),
      MON_FRI_8H,
      [],
      [],
      null,
    );
    expect(result.feasible).toBe(false);
    expect(result.conflictingWeeks).toHaveLength(1);
    expect(result.conflictingWeeks[0].requested).toBe(50);
    expect(result.conflictingWeeks[0].available).toBe(40);
  });

  it("accounts for existing reservations", () => {
    const existing = [reservation(6, "2025-01-13", "2025-01-17")];
    const result = checkReservationFeasibility(
      6,
      new Date("2025-01-13"),
      new Date("2025-01-17"),
      MON_FRI_8H,
      [],
      existing,
      null,
    );
    expect(result.feasible).toBe(false);
  });

  it("excludes a reservation by id when updating", () => {
    const existing = [reservation(6, "2025-01-13", "2025-01-17", "CONFIRMED", "res-1")];
    const result = checkReservationFeasibility(
      6,
      new Date("2025-01-13"),
      new Date("2025-01-17"),
      MON_FRI_8H,
      [],
      existing as Parameters<typeof checkReservationFeasibility>[5],
      null,
      "res-1",
    );
    expect(result.feasible).toBe(true);
  });

  it("handles reservation spanning multiple weeks", () => {
    const result = checkReservationFeasibility(
      6,
      new Date("2025-01-13"),
      new Date("2025-01-26"),
      MON_FRI_8H,
      [],
      [],
      null,
    );
    expect(result.feasible).toBe(true);
  });
});

describe("timezone edge cases", () => {
  it("calculates capacity correctly for IST (UTC+5:30)", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(weekStart, MON_FRI_8H, [], [], null);
    expect(result.base).toBe(40);
    expect(result.available).toBe(40);
  });

  it("calculates capacity correctly for NZ (UTC+12/+13)", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const result = calculateAvailableCapacity(weekStart, MON_FRI_8H, [], [], null);
    expect(result.base).toBe(40);
    expect(result.available).toBe(40);
  });

  it("handles absence spanning DST transition in NZ", () => {
    const weekStart = new Date("2025-04-07T00:00:00Z");
    const absences = [absence("2025-04-07", "2025-04-11")];
    const result = calculateAvailableCapacity(weekStart, MON_FRI_8H, absences, [], null);
    expect(result.absenceHours).toBe(40);
  });
});
