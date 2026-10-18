// Siffrorna till mätarna "Dagar kvar att planera" i planeraren.

import { Parent } from "../types";
import { RULES } from "../rules";
import { isValidDate } from "./dates";
import { daysByLevel, getOverlaps } from "./periodHelpers";
import { doubleDaySegments, timelineMarkers } from "./timeline";

const DAYS = RULES.days;

export interface MeterData {
  /** Använda dagar per aktiv förälder */
  perParent: number[];
  used: number;
  max: number;
  remaining: number;
  /** Dagar över taket */
  over: number;
}

export interface DaysMetersData {
  high: MeterData;
  low: MeterData;
  /** Bara vid två föräldrar */
  double?: MeterData & { late: number };
}

const meter = (perParent: number[], max: number): MeterData => {
  const used = perParent.reduce((sum, days) => sum + days, 0);
  return {
    perParent,
    used,
    max,
    remaining: Math.max(0, max - used),
    over: Math.max(0, used - max),
  };
};

export const daysMeters = (
  parents: Parent[],
  numParents: 1 | 2,
  birthDate: string
): DaysMetersData => {
  const active = parents.slice(0, numParents);
  const levels = active.map((p) => daysByLevel(p.periods));
  const result: DaysMetersData = {
    high: meter(levels.map((l) => l.high), DAYS.highLevelTotal),
    low: meter(levels.map((l) => l.low), DAYS.lowLevelTotal),
  };

  if (numParents === 2) {
    const overlaps = getOverlaps(active[0].periods, active[1].periods);
    const used = overlaps.reduce((sum, o) => sum + o.days, 0);
    const late = isValidDate(birthDate)
      ? doubleDaySegments(overlaps, timelineMarkers(birthDate).fifteenMonths)
          .filter((s) => s.late)
          .reduce((sum, s) => sum + s.days, 0)
      : 0;
    // En dubbeldag räknas en gång, inte per förälder
    result.double = { ...meter([used], DAYS.maxDoubleDays), late };
  }

  return result;
};
