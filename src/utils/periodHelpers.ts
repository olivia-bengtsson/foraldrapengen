import { ParentalPeriod } from "../types";
import { addDays, fromDayNumber, toDayNumber, todayDate } from "./dates";

// Helper to generate unique IDs for periods
export const generatePeriodId = (): string => {
  return `period-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/** Sista dagen i perioden. Startdagen är dag 1, så 1 vecka från en måndag slutar på söndagen. */
export const periodEnd = (period: ParentalPeriod): string =>
  addDays(period.start, period.weeks * 7 - 1);

/** Antal föräldrapenningdagar i perioden. */
export const periodDays = (period: ParentalPeriod): number =>
  period.weeks * period.daysPerWeek;

/** Månader → veckor, avrundat till hela veckor (Snabbstart). */
export const weeksFromMonths = (months: number): number =>
  Math.round((months * 52) / 12);

/** Veckor → ungefärligt antal månader, avrundat till halva månader. */
export const monthsFromWeeks = (weeks: number): number =>
  Math.round(((weeks * 12) / 52) * 2) / 2;

/** Första dagen efter förälderns sista period, eller dagens datum om det inte finns några. */
export const nextFreeStart = (periods: ParentalPeriod[]): string =>
  periods.length === 0 ? todayDate() : addDays(getLatestEndDate(periods), 1);

// Calculate total days from all periods
export const getTotalDaysFromPeriods = (periods: ParentalPeriod[]): number => {
  return periods.reduce((sum, period) => sum + periodDays(period), 0);
};

// Get earliest start date from all periods
export const getEarliestStartDate = (periods: ParentalPeriod[]): string => {
  const days = periods.map((p) => toDayNumber(p.start)).filter((d) => !isNaN(d));
  return days.length === 0 ? todayDate() : fromDayNumber(Math.min(...days));
};

// Get latest end date from all periods
export const getLatestEndDate = (periods: ParentalPeriod[]): string => {
  const days = periods.map((p) => toDayNumber(periodEnd(p))).filter((d) => !isNaN(d));
  return days.length === 0 ? todayDate() : fromDayNumber(Math.max(...days));
};

// Validate that periods don't overlap for the same parent
export const validateNoOverlap = (
  periods: ParentalPeriod[]
): {
  valid: boolean;
  message?: string;
  overlappingPeriods?: [number, number];
} => {
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const start1 = toDayNumber(periods[i].start);
      const end1 = toDayNumber(periodEnd(periods[i]));
      const start2 = toDayNumber(periods[j].start);
      const end2 = toDayNumber(periodEnd(periods[j]));

      // Check if periods overlap
      if (start1 <= end2 && start2 <= end1) {
        return {
          valid: false,
          message: `Period ${i + 1} och Period ${j + 1} överlappar`,
          overlappingPeriods: [i, j],
        };
      }
    }
  }

  return { valid: true };
};

export interface PeriodOverlap {
  start: string;
  end: string;
  /** Dubbeldagar: ceil(kalenderdagar × lägsta dagar per vecka / 7) */
  days: number;
}

/** Överlapp mellan två föräldrars perioder, dvs. dagar då båda är lediga. */
export const getOverlaps = (
  periods1: ParentalPeriod[],
  periods2: ParentalPeriod[]
): PeriodOverlap[] => {
  const overlaps: PeriodOverlap[] = [];

  for (const p1 of periods1) {
    for (const p2 of periods2) {
      const overlapStart = Math.max(toDayNumber(p1.start), toDayNumber(p2.start));
      const overlapEnd = Math.min(
        toDayNumber(periodEnd(p1)),
        toDayNumber(periodEnd(p2))
      );

      if (overlapStart <= overlapEnd) {
        const calendarDays = overlapEnd - overlapStart + 1;
        const minDaysPerWeek = Math.min(p1.daysPerWeek, p2.daysPerWeek);
        overlaps.push({
          start: fromDayNumber(overlapStart),
          end: fromDayNumber(overlapEnd),
          days: Math.ceil((calendarDays * minDaysPerWeek) / 7),
        });
      }
    }
  }

  return overlaps;
};

/** Antal dubbeldagar ur överlappet mellan föräldrarnas perioder. */
export const calculateDoubleDays = (
  periods1: ParentalPeriod[],
  periods2: ParentalPeriod[]
): number =>
  getOverlaps(periods1, periods2).reduce((sum, overlap) => sum + overlap.days, 0);
