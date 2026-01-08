import { Parent, ParentalPeriod } from "../types";

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
    periods: [period],
  };
};

// Calculate total days from all periods
export const getTotalDaysFromPeriods = (periods: ParentalPeriod[]): number => {
  return periods.reduce((sum, period) => sum + period.daysToTake, 0);
};

// Get earliest start date from all periods
export const getEarliestStartDate = (periods: ParentalPeriod[]): string => {
  if (periods.length === 0) return new Date().toISOString().split("T")[0];

  const dates = periods.map((p) => new Date(p.startDate));
  const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
  return earliest.toISOString().split("T")[0];
};

// Get latest end date from all periods
export const getLatestEndDate = (periods: ParentalPeriod[]): string => {
  if (periods.length === 0) return new Date().toISOString().split("T")[0];

  const dates = periods.map((p) => new Date(p.endDate));
  const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
  return latest.toISOString().split("T")[0];
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
      const start1 = new Date(periods[i].startDate);
      const end1 = new Date(periods[i].endDate);
      const start2 = new Date(periods[j].startDate);
      const end2 = new Date(periods[j].endDate);

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
