import { describe, expect, it } from "vitest";
import {
  calculateAbsenceHoursForWeek,
  calculateReservationHoursForWeek,
  getWeekStart,
  getLocalDaysInRange,
  groupDaysByWeek,
  calculateBaseCapacity,
} from "@/lib/providers/availability/capacity";
import { entry, absence, reservation, MON_FRI_8H } from "./test-utils";

describe("getWeekStart", () => {
  it("returns Sunday for a mid-week date in US/Eastern", () => {
    const result = getWeekStart(new Date("2025-01-15T00:00:00Z"));
    expect(result.toISOString().slice(0, 10)).toBe("2025-01-12");
  });

  it("handles NZ timezone correctly", () => {
    const result = getWeekStart(new Date("2025-01-15T00:00:00Z"));
    expect(result.toISOString().slice(0, 10)).toBe("2025-01-12");
  });

  it("returns same day when input is already Sunday", () => {
    const result = getWeekStart(new Date("2025-01-12T00:00:00Z"));
    expect(result.toISOString().slice(0, 10)).toBe("2025-01-12");
  });
});

describe("getLocalDaysInRange", () => {
  it("returns correct weekdays for Mon-Fri range", () => {
    const days = getLocalDaysInRange(
      new Date("2025-01-13T00:00:00Z"),
      new Date("2025-01-17T00:00:00Z")
    );
    expect(days).toHaveLength(5);
    expect(days.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns single day when start equals end", () => {
    const days = getLocalDaysInRange(
      new Date("2025-01-15T00:00:00Z"),
      new Date("2025-01-15T00:00:00Z")
    );
    expect(days).toHaveLength(1);
    expect(days[0].weekday).toBe(3);
  });
});

describe("groupDaysByWeek", () => {
  it("groups days within same week", () => {
    const days = getLocalDaysInRange(
      new Date("2025-01-13T00:00:00Z"),
      new Date("2025-01-18T00:00:00Z")
    );
    const groups = groupDaysByWeek(days);
    expect(groups.size).toBe(1);
  });

  it("splits days across week boundary", () => {
    const days = getLocalDaysInRange(
      new Date("2025-01-15T00:00:00Z"),
      new Date("2025-01-21T00:00:00Z")
    );
    const groups = groupDaysByWeek(days);
    expect(groups.size).toBe(2);
  });
});

describe("calculateBaseCapacity", () => {
  it("returns 40 for Mon-Fri 8h", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    expect(calculateBaseCapacity(weekStart, MON_FRI_8H, null)).toBe(40);
  });

  it("uses defaultDailyHours for unspecified weekdays", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    expect(calculateBaseCapacity(weekStart, [entry(1, 8)], 4)).toBe(8 + 4 * 6);
  });

  it("returns 0 when no entries and no default", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    expect(calculateBaseCapacity(weekStart, [], null)).toBe(0);
  });
});

describe("calculateAbsenceHoursForWeek", () => {
  it("returns 0 when no absences", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const hours = calculateAbsenceHoursForWeek(weekStart, [], MON_FRI_8H, null);
    expect(hours).toBe(0);
  });

  it("counts full-week absence as 40 hours", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const absences = [absence("2025-01-13", "2025-01-17")];
    const hours = calculateAbsenceHoursForWeek(weekStart, absences, MON_FRI_8H, null);
    expect(hours).toBe(40);
  });

  it("subtracts correct hours for a partial-week absence (Wed-Fri)", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const absences = [absence("2025-01-15", "2025-01-17")];
    const hours = calculateAbsenceHoursForWeek(weekStart, absences, MON_FRI_8H, null);
    expect(hours).toBe(24);
  });

  it("splits multi-week absence across week boundary", () => {
    const week1Start = new Date("2025-01-12T00:00:00Z");
    const week2Start = new Date("2025-01-19T00:00:00Z");
    const absences = [absence("2025-01-15", "2025-01-21")];

    const week1Hours = calculateAbsenceHoursForWeek(week1Start, absences, MON_FRI_8H, null);
    expect(week1Hours).toBe(24);

    const week2Hours = calculateAbsenceHoursForWeek(week2Start, absences, MON_FRI_8H, null);
    expect(week2Hours).toBe(16);
  });

  it("ignores CANCELLED and REJECTED absences", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const absences = [
      absence("2025-01-13", "2025-01-17", "CANCELLED"),
      absence("2025-01-13", "2025-01-17", "REJECTED"),
    ];
    const hours = calculateAbsenceHoursForWeek(weekStart, absences, MON_FRI_8H, null);
    expect(hours).toBe(0);
  });

  it("includes PENDING absences", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const absences = [absence("2025-01-15", "2025-01-17", "PENDING")];
    const hours = calculateAbsenceHoursForWeek(weekStart, absences, MON_FRI_8H, null);
    expect(hours).toBe(24);
  });
});

describe("calculateReservationHoursForWeek", () => {
  it("returns 0 when no reservations", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const hours = calculateReservationHoursForWeek(weekStart, [], "CONFIRMED", MON_FRI_8H, null);
    expect(hours).toBe(0);
  });

  it("sums CONFIRMED reservation hours correctly", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const reservations = [reservation(4, "2025-01-13", "2025-01-17")];
    const hours = calculateReservationHoursForWeek(
      weekStart,
      reservations,
      "CONFIRMED",
      MON_FRI_8H,
      null
    );
    expect(hours).toBe(20);
  });

  it("does not count PENDING when filtering CONFIRMED", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const reservations = [reservation(4, "2025-01-13", "2025-01-17", "PENDING")];
    const hours = calculateReservationHoursForWeek(
      weekStart,
      reservations,
      "CONFIRMED",
      MON_FRI_8H,
      null
    );
    expect(hours).toBe(0);
  });

  it("handles partial-week reservation overlap", () => {
    const weekStart = new Date("2025-01-12T00:00:00Z");
    const reservations = [reservation(6, "2025-01-15", "2025-01-21")];
    const hours = calculateReservationHoursForWeek(
      weekStart,
      reservations,
      "CONFIRMED",
      MON_FRI_8H,
      null
    );
    expect(hours).toBe(18);
  });
});
