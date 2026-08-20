export interface WeeklyCapacityEntry {
  weekday: number;
  hoursPerDay: number;
}

export interface AbsenceRecord {
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface ReservationRecord {
  hoursPerDay: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface WeeklyCapacityResult {
  weekStart: Date;
  base: number;
  absenceHours: number;
  confirmedReservationHours: number;
  pendingReservationHours: number;
  available: number;
}

export interface CapacityWarning {
  reservationId: string;
  engagementId: string | null;
  affectedWeeks: { weekStart: Date; wasAvailable: number; nowNegative: number }[];
}

import { getWeekStart, addDays, toDateKey, keyWeekday } from "./capacity-utils";
import { calculateAbsenceHoursForWeek, calculateReservationHoursForWeek } from "./capacity-queries";

export {
  getWeekStart,
  getLocalDaysInRange,
  keyWeekday,
  toDateKey,
  addDays,
} from "./capacity-utils";
export {
  checkReservationFeasibility,
  calculateAbsenceHoursForWeek,
  calculateReservationHoursForWeek,
} from "./capacity-queries";

export function groupDaysByWeek(
  days: { weekday: number; date: Date; key: string }[]
): Map<string, { weekday: number; date: Date; key: string }[]> {
  const groups = new Map<string, { weekday: number; date: Date; key: string }[]>();
  for (const day of days) {
    const wkday = keyWeekday(day.key);
    const [y, m, d] = day.key.split("-").map(Number);
    const wsKey = `${y}-${String(m).padStart(2, "0")}-${String(d - wkday).padStart(2, "0")}`;
    const arr = groups.get(wsKey) ?? [];
    arr.push(day);
    groups.set(wsKey, arr);
  }
  return groups;
}

export function calculateBaseCapacity(
  weekStart: Date,
  weeklyEntries: WeeklyCapacityEntry[],
  defaultDailyHours: number | null
): number {
  const entryMap = new Map(weeklyEntries.map((e) => [e.weekday, e.hoursPerDay]));
  const [y, m, d] = toDateKey(weekStart).split("-").map(Number);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const key = toDateKey(new Date(Date.UTC(y, m - 1, d + i)));
    const weekday = keyWeekday(key);
    total += entryMap.get(weekday) ?? defaultDailyHours ?? 0;
  }
  return total;
}

export function calculateAvailableCapacity(
  weekStart: Date,
  weeklyEntries: WeeklyCapacityEntry[],
  absences: AbsenceRecord[],
  reservations: ReservationRecord[],
  defaultDailyHours: number | null
): WeeklyCapacityResult {
  const base = calculateBaseCapacity(weekStart, weeklyEntries, defaultDailyHours);
  const absenceHours = calculateAbsenceHoursForWeek(
    weekStart,
    absences,
    weeklyEntries,
    defaultDailyHours
  );
  const confirmedReservationHours = calculateReservationHoursForWeek(
    weekStart,
    reservations,
    "CONFIRMED",
    weeklyEntries,
    defaultDailyHours
  );
  const pendingReservationHours = calculateReservationHoursForWeek(
    weekStart,
    reservations,
    "PENDING",
    weeklyEntries,
    defaultDailyHours
  );

  return {
    weekStart: new Date(weekStart),
    base,
    absenceHours,
    confirmedReservationHours,
    pendingReservationHours,
    available: base - absenceHours - confirmedReservationHours,
  };
}

export function calculateCapacityRange(
  startDate: Date,
  weeks: number,
  weeklyEntries: WeeklyCapacityEntry[],
  absences: AbsenceRecord[],
  reservations: ReservationRecord[],
  defaultDailyHours: number | null
): WeeklyCapacityResult[] {
  const results: WeeklyCapacityResult[] = [];
  let cur = getWeekStart(startDate);
  for (let i = 0; i < weeks; i++) {
    results.push(
      calculateAvailableCapacity(cur, weeklyEntries, absences, reservations, defaultDailyHours)
    );
    cur = addDays(cur, 7);
  }
  return results;
}
