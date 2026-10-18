// Rena kalenderdatum utan tidszon (A15).
//
// Ett datum lagras alltid som strängen "YYYY-MM-DD". För att räkna görs det om till
// ett dagnummer (heltal dagar sedan 1970-01-01) med Date.UTC, så att tid på dygnet,
// tidszon och sommartid aldrig påverkar resultatet. Bara "idag" läses i lokal tid.

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface DateParts {
  year: number;
  /** 0–11, som i Date */
  month: number;
  day: number;
}

const pad = (n: number, length = 2) => String(n).padStart(length, "0");

/** Dagnummer för år, månad (0–11) och dag. Hanterar överspill, t.ex. dag 0 = sista dagen förra månaden. */
export const dayNumberFromParts = (year: number, month: number, day: number): number =>
  Math.round(Date.UTC(year, month, day) / MS_PER_DAY);

/** "YYYY-MM-DD" → dagnummer. Ger NaN för ogiltiga datum. */
export const toDayNumber = (date: string): number => {
  const match = DATE_PATTERN.exec(date);
  if (!match) return NaN;
  const [, y, m, d] = match.map(Number);
  return dayNumberFromParts(y, m - 1, d);
};

export const isValidDate = (date: string): boolean => !isNaN(toDayNumber(date));

/** Dagnummer → "YYYY-MM-DD" */
export const fromDayNumber = (dayNumber: number): string => {
  const d = new Date(dayNumber * MS_PER_DAY);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

export const dateParts = (date: string): DateParts => {
  const d = new Date(toDayNumber(date) * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
};

/** Dagens datum i användarens lokala tid (inte UTC). */
export const todayDate = (): string => {
  const now = new Date();
  return fromDayNumber(dayNumberFromParts(now.getFullYear(), now.getMonth(), now.getDate()));
};

export const addDays = (date: string, days: number): string =>
  fromDayNumber(toDayNumber(date) + days);

/** Antal dagar från a till b (b − a). Negativt om b är före a. */
export const diffDays = (a: string, b: string): number => toDayNumber(b) - toDayNumber(a);

/** Dagnummer för första dagen i månaden (month 0–11). */
export const monthStartDay = (year: number, month: number): number =>
  dayNumberFromParts(year, month, 1);

/** Dagnummer för sista dagen i månaden (month 0–11). */
export const monthEndDay = (year: number, month: number): number =>
  dayNumberFromParts(year, month + 1, 0);

export const daysInMonth = (year: number, month: number): number =>
  monthEndDay(year, month) - monthStartDay(year, month) + 1;

/** "2027-03-21" → "21 mars 2027" (sv) / "21 Mar 2027" (en). Tidszonen påverkar inte datumet. */
export const formatDate = (date: string, locale: string): string => {
  const day = toDayNumber(date);
  if (isNaN(day)) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(day * MS_PER_DAY));
};

/**
 * Lägger till månader. Finns inte dagen i målmånaden blir det månadens sista dag
 * (lagen om beräkning av lagstadgad tid), t.ex. 31 jan + 1 mån = 28 feb.
 */
export const addMonths = (date: string, months: number): string => {
  const { year, month, day } = dateParts(date);
  const target = dayNumberFromParts(year, month + months, 1);
  const { year: targetYear, month: targetMonth } = dateParts(fromDayNumber(target));
  const lastDay = daysInMonth(targetYear, targetMonth);
  return fromDayNumber(dayNumberFromParts(targetYear, targetMonth, Math.min(day, lastDay)));
};

/** Lägger till år. Barn födda 29 februari fyller år 28 februari vanliga år. */
export const addYears = (date: string, years: number): string =>
  addMonths(date, years * 12);

/** Kort månadsnamn, t.ex. "mars" eller "mars 27" med år. Tidszonen påverkar inte. */
export const formatMonth = (date: string, locale: string, withYear = false): string => {
  const day = toDayNumber(date);
  if (isNaN(day)) return "";
  const d = new Date(day * MS_PER_DAY);
  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(d);
  return withYear ? `${month} ${String(d.getUTCFullYear()).slice(2)}` : month;
};
