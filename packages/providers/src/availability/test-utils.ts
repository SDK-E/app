import type { WeeklyCapacityEntry, AbsenceRecord, ReservationRecord } from "./capacity";

export const TZ_US = "America/New_York";
export const TZ_NZ = "Pacific/Auckland";
export const TZ_IST = "Asia/Kolkata";

export function entry(weekday: number, hours: number): WeeklyCapacityEntry {
  return { weekday, hoursPerDay: hours };
}

export function absence(start: string, end: string, status = "APPROVED"): AbsenceRecord {
  return { startDate: new Date(start), endDate: new Date(end), status };
}

export function reservation(
  hoursPerDay: number,
  start: string,
  end: string,
  status = "CONFIRMED",
  id?: string
): ReservationRecord {
  const r: ReservationRecord & { id?: string } = {
    hoursPerDay,
    startDate: new Date(start),
    endDate: new Date(end),
    status,
  };
  if (id) r.id = id;
  return r;
}

export const MON_FRI_8H: WeeklyCapacityEntry[] = [
  entry(1, 8),
  entry(2, 8),
  entry(3, 8),
  entry(4, 8),
  entry(5, 8),
];
