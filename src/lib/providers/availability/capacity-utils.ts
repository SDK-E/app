export const MS_PER_DAY = 86_400_000;

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

export function parseKey(k: string): Date {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const JAN1_2000_MS = Date.UTC(2000, 0, 1);

export function keyWeekday(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  const days = (Date.UTC(y, m - 1, d) - JAN1_2000_MS) / MS_PER_DAY;
  return ((days % 7) + 7 + 6) % 7;
}

export function getWeekStart(utcDate: Date): Date {
  const key = toDateKey(utcDate);
  const wkday = keyWeekday(key);
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - wkday));
}

export function getLocalDaysInRange(
  start: Date,
  end: Date
): { weekday: number; date: Date; key: string }[] {
  const result: { weekday: number; date: Date; key: string }[] = [];
  const startKey = toDateKey(start);
  const endKey = toDateKey(end);
  const [sy, sm, sd] = startKey.split("-").map(Number);
  const dayCount = (new Date(endKey).getTime() - new Date(startKey).getTime()) / MS_PER_DAY;

  for (let i = 0; i <= dayCount; i++) {
    const ms = Date.UTC(sy, sm - 1, sd + i);
    const key = toDateKey(new Date(ms));
    const weekday = keyWeekday(key);
    result.push({ weekday, date: new Date(ms), key });
  }
  return result;
}
