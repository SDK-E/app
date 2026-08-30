import type { AbsenceRecord, ReservationRecord, WeeklyCapacityEntry } from "./capacity";

import {
  addDays,
  getLocalDaysInRange,
  keyWeekday,
  parseKey,
  toDateKey,
  getWeekStart as utilsGetWeekStart,
} from "./capacity-utils";

export function calculateAbsenceHoursForWeek(
  weekStart: Date,
  absences: AbsenceRecord[],
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: null | number,
): number {
  return absenceHours(weekStart, absences, weeklyEntries, defaultDailyHours);
}

export function calculateReservationHoursForWeek(
  weekStart: Date,
  reservations: ReservationRecord[],
  statusFilter: "CONFIRMED" | "PENDING",
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: null | number,
): number {
  const filtered = reservations.filter((r) => r.status === statusFilter);
  if (filtered.length === 0) return 0;

  const workingDays = weekDaySet(weeklyEntries, defaultDailyHours);
  const wsKey = toDateKey(weekStart);
  const weKey = toDateKey(addDays(weekStart, 6));

  let total = 0;
  for (const r of filtered) {
    const oStart = maxKey(toDateKey(r.startDate), wsKey);
    const oEnd = minKey(toDateKey(r.endDate), weKey);
    if (oStart > oEnd) continue;

    for (const day of getLocalDaysInRange(parseKey(oStart), parseKey(oEnd))) {
      if (workingDays.has(day.weekday)) total += r.hoursPerDay;
    }
  }
  return total;
}

export function checkReservationFeasibility(
  hoursPerDay: number,
  startDate: Date,
  endDate: Date,
  weeklyEntries: WeeklyCapacityEntry[],
  absences: AbsenceRecord[],
  reservations: ReservationRecord[],
  defaultDailyHours: null | number,
  excludeReservationId?: string,
): {
  feasible: boolean;
  conflictingWeeks: { weekStart: Date; available: number; requested: number }[];
} {
  const filtered = excludeReservationId
    ? reservations.filter((r) => (r as { id?: string }).id !== excludeReservationId)
    : reservations;

  const first = utilsGetWeekStart(startDate);
  const last = utilsGetWeekStart(endDate);
  const resStartKey = toDateKey(startDate);
  const resEndKey = toDateKey(endDate);
  const workingDays = weekDaySet(weeklyEntries, defaultDailyHours);

  const conflictingWeeks: { weekStart: Date; available: number; requested: number }[] = [];
  let cur = new Date(first);

  while (cur <= last) {
    const base = baseCapacity(cur, weeklyEntries, defaultDailyHours);
    const absence = absenceHours(cur, absences, weeklyEntries, defaultDailyHours);
    const confirmed = confirmedReservationHours(cur, filtered, weeklyEntries, defaultDailyHours);
    const available = base - absence - confirmed;

    const wsKey = toDateKey(cur);
    const weKey = toDateKey(addDays(cur, 6));
    const oStart = maxKey(resStartKey, wsKey);
    const oEnd = minKey(resEndKey, weKey);

    if (oStart <= oEnd) {
      let requested = 0;
      for (const day of getLocalDaysInRange(parseKey(oStart), parseKey(oEnd))) {
        if (workingDays.has(day.weekday)) requested += hoursPerDay;
      }
      if (requested > available) {
        conflictingWeeks.push({ weekStart: new Date(cur), available, requested });
      }
    }

    cur = addDays(cur, 7);
  }

  return { feasible: conflictingWeeks.length === 0, conflictingWeeks };
}

function absenceHours(
  weekStart: Date,
  absences: AbsenceRecord[],
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: null | number,
): number {
  const active = absences.filter((a) => a.status === "APPROVED" || a.status === "PENDING");
  if (active.length === 0) return 0;

  const entryMap = new Map(weeklyEntries.map((e) => [e.weekday, e.hoursPerDay]));
  const wsKey = toDateKey(weekStart);
  const weKey = toDateKey(addDays(weekStart, 6));

  let total = 0;
  for (const a of active) {
    const oStart = maxKey(toDateKey(a.startDate), wsKey);
    const oEnd = minKey(toDateKey(a.endDate), weKey);
    if (oStart > oEnd) continue;

    for (const day of getLocalDaysInRange(parseKey(oStart), parseKey(oEnd))) {
      total += entryMap.get(day.weekday) ?? defaultDailyHours ?? 0;
    }
  }
  return total;
}

function baseCapacity(
  weekStart: Date,
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: null | number,
): number {
  const entryMap = new Map(weeklyEntries.map((e) => [e.weekday, e.hoursPerDay]));
  const wsKey = toDateKey(weekStart);
  const [y, m, d] = wsKey.split("-").map(Number);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const key = toDateKey(new Date(Date.UTC(y, m - 1, d + i)));
    const weekday = keyWeekday(key);
    total += entryMap.get(weekday) ?? defaultDailyHours ?? 0;
  }
  return total;
}

function confirmedReservationHours(
  weekStart: Date,
  reservations: ReservationRecord[],
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: null | number,
): number {
  const filtered = reservations.filter((r) => r.status === "CONFIRMED");
  if (filtered.length === 0) return 0;

  const workingDays = weekDaySet(weeklyEntries, defaultDailyHours);
  const wsKey = toDateKey(weekStart);
  const weKey = toDateKey(addDays(weekStart, 6));

  let total = 0;
  for (const r of filtered) {
    const oStart = maxKey(toDateKey(r.startDate), wsKey);
    const oEnd = minKey(toDateKey(r.endDate), weKey);
    if (oStart > oEnd) continue;

    for (const day of getLocalDaysInRange(parseKey(oStart), parseKey(oEnd))) {
      if (workingDays.has(day.weekday)) total += r.hoursPerDay;
    }
  }
  return total;
}

function maxKey(a: string, b: string): string {
  return a > b ? a : b;
}

function minKey(a: string, b: string): string {
  return a < b ? a : b;
}

function weekDaySet(
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: null | number,
): Set<number> {
  const entryMap = new Map(weeklyEntries.map((e) => [e.weekday, e.hoursPerDay]));
  const set = new Set<number>();
  for (let w = 0; w < 7; w++) {
    if ((entryMap.get(w) ?? defaultDailyHours ?? 0) > 0) set.add(w);
  }
  return set;
}
