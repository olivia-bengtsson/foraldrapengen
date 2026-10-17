import { Parent, ParentalPeriod } from "../types";
import {
  addDays,
  fromDayNumber,
  isValidDate,
  toDayNumber,
  todayDate,
} from "./dates";

// Helper to generate unique IDs for periods
export const generatePeriodId = (): string => {
  return `period-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Migrate old Parent format (with single startDate/endDate/daysToTake/daysPerWeek)
// to new format with periods array
export const migrateParentToPeriods = (oldParent: any): Parent => {
  // If already has periods, return as is
  if (oldParent.periods && Array.isArray(oldParent.periods)) {
    return oldParent as Parent;
  }

  // Convert single period to periods array
  const period: ParentalPeriod = {
    id: generatePeriodId(),
    startDate: oldParent.startDate,
    endDate: oldParent.endDate,
    daysToTake: oldParent.daysToTake,
    daysPerWeek: oldParent.daysPerWeek,
  };

  return {
    id: oldParent.id,
    name: oldParent.name,
    type: oldParent.type,
    monthlySalary: oldParent.monthlySalary,
    employerTopUp: oldParent.employerTopUp,
    employerTopUpDays: oldParent.employerTopUpDays || 360, // Default 360 if missing
    periods: [period],
  };
};

// Calculate total days from all periods
export const getTotalDaysFromPeriods = (periods: ParentalPeriod[]): number => {
  return periods.reduce((sum, period) => sum + period.daysToTake, 0);
};

// Get earliest start date from all periods
export const getEarliestStartDate = (periods: ParentalPeriod[]): string => {
  const days = periods.map((p) => toDayNumber(p.startDate)).filter((d) => !isNaN(d));
  return days.length === 0 ? todayDate() : fromDayNumber(Math.min(...days));
};

// Get latest end date from all periods
export const getLatestEndDate = (periods: ParentalPeriod[]): string => {
  const days = periods.map((p) => toDayNumber(p.endDate)).filter((d) => !isNaN(d));
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
      const start1 = toDayNumber(periods[i].startDate);
      const end1 = toDayNumber(periods[i].endDate);
      const start2 = toDayNumber(periods[j].startDate);
      const end2 = toDayNumber(periods[j].endDate);

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

/**
 * Slutdatum för en period: start + ceil(dagar × 7 / dagar per vecka) kalenderdagar.
 * Ogiltigt startdatum ger dagens datum.
 * OBS: räknar inte startdagen som dag 1, så slutdatumet blir en dag för sent (A3, rättas i Fas 1 punkt 3).
 */
export const getDateAfterDays = (
  startDate: string,
  days: number,
  daysPerWeek: number
): string => {
  if (!isValidDate(startDate)) return todayDate();
  return addDays(startDate, Math.ceil((days * 7) / daysPerWeek));
};

/**
 * Dubbeldagar ur överlappet mellan två föräldrars perioder.
 * Varje överlapp räknas som ceil(kalenderdagar × lägsta dagar per vecka / 7).
 */
export const calculateDoubleDays = (
  periods1: ParentalPeriod[],
  periods2: ParentalPeriod[]
): number => {
  let total = 0;

  for (const p1 of periods1) {
    for (const p2 of periods2) {
      const overlapStart = Math.max(toDayNumber(p1.startDate), toDayNumber(p2.startDate));
      const overlapEnd = Math.min(toDayNumber(p1.endDate), toDayNumber(p2.endDate));

      if (overlapStart <= overlapEnd) {
        const overlapDays = overlapEnd - overlapStart + 1;
        const minDaysPerWeek = Math.min(p1.daysPerWeek, p2.daysPerWeek);
        total += Math.ceil((overlapDays * minDaysPerWeek) / 7);
      }
    }
  }

  return total;
};
