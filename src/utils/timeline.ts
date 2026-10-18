// Tidslinjen i planeraren: tidsspann, axel, markeringar, dubbeldagar och täckning
// ("Någon hemma"). Ren logik utan React (docs/PLANERARE.md).

import { ParentalPeriod } from "../types";
import { RULES } from "../rules";
import { addMonths, addYears, fromDayNumber, toDayNumber } from "./dates";
import { periodEnd, PeriodOverlap } from "./periodHelpers";

const MIN_MONTHS = 18;
const MAX_MONTHS = 30;
const DAYS_PER_MONTH = 365.25 / 12;
const AXIS_STEPS = [1, 2, 3, 4, 6];
/** Ungefärlig bredd per axeletikett i px */
const AXIS_LABEL_WIDTH = 52;

export interface TimelineRange {
  start: string;
  end: string;
  months: number;
}

/** Från födseln, 18–30 månader beroende på hur lång planen är. */
export const timelineRange = (birthDate: string, periods: ParentalPeriod[]): TimelineRange => {
  const birth = toDayNumber(birthDate);
  const lastDay = periods.reduce(
    (max, p) => Math.max(max, toDayNumber(periodEnd(p))),
    birth
  );
  const months = Math.min(
    MAX_MONTHS,
    Math.max(MIN_MONTHS, Math.ceil((lastDay - birth) / DAYS_PER_MONTH) + 1)
  );
  return { start: birthDate, end: addMonths(birthDate, months), months };
};

/** Position i procent av tidslinjen, begränsad till 0–100. day är ett dagnummer. */
export const toPercent = (day: number, range: TimelineRange): number => {
  const start = toDayNumber(range.start);
  const end = toDayNumber(range.end);
  return Math.min(100, Math.max(0, ((day - start) / (end - start)) * 100));
};

/** Vänsterkant och bredd i procent för dagarna start–end (inklusive). */
export const spanPercent = (start: string, end: string, range: TimelineRange) => {
  const left = toPercent(toDayNumber(start), range);
  const right = toPercent(toDayNumber(end) + 1, range);
  return { left, width: Math.max(0, right - left) };
};

export interface AxisTick {
  date: string;
  /** Månader efter födseln */
  month: number;
}

/** Axeletiketter med så stort steg att de får plats i bredden. */
export const axisTicks = (range: TimelineRange, widthPx: number): AxisTick[] => {
  const step =
    AXIS_STEPS.find((s) => range.months / s + 1 <= widthPx / AXIS_LABEL_WIDTH) ??
    AXIS_STEPS[AXIS_STEPS.length - 1];
  const ticks: AxisTick[] = [];
  for (let month = 0; month <= range.months; month += step) {
    ticks.push({ date: addMonths(range.start, month), month });
  }
  return ticks;
};

/** Barnets ettårsdag och dagen barnet fyller 15 månader (sista dagen för dubbeldagar). */
export const timelineMarkers = (birthDate: string) => ({
  oneYear: addYears(birthDate, 1),
  fifteenMonths: addMonths(birthDate, RULES.days.doubleDaysMaxAgeMonths),
});

export interface DoubleDaySegment {
  start: string;
  end: string;
  days: number;
  /** På eller efter dagen barnet fyller 15 månader */
  late: boolean;
}

const doubleDays = (start: number, end: number, daysPerWeek: number) =>
  Math.ceil(((end - start + 1) * daysPerWeek) / 7);

/** Överlapp (dubbeldagar), delade vid 15-månadersgränsen. */
export const doubleDaySegments = (
  overlaps: PeriodOverlap[],
  limit: string
): DoubleDaySegment[] => {
  const limitDay = toDayNumber(limit);

  return overlaps.flatMap((overlap) => {
    const start = toDayNumber(overlap.start);
    const end = toDayNumber(overlap.end);
    const segment = (from: number, to: number, late: boolean): DoubleDaySegment => ({
      start: fromDayNumber(from),
      end: fromDayNumber(to),
      days: doubleDays(from, to, overlap.daysPerWeek),
      late,
    });

    if (end < limitDay) return [segment(start, end, false)];
    if (start >= limitDay) return [segment(start, end, true)];
    return [segment(start, limitDay - 1, false), segment(limitDay, end, true)];
  });
};

export type Coverage = "full" | "partial" | "gap";

export interface CoverageSegment {
  start: string;
  end: string;
  coverage: Coverage;
}

/**
 * Om någon är hemma, dag för dag, från födseln till sista ledighetsdagen:
 * - full: någon förälder är ledig hela veckan, dvs. minst 5 dagar/vecka eller helt ledig
 *   (worksOtherDays = false) även om färre dagar tas ut.
 * - partial: bara perioder med färre än 5 dagar/vecka där föräldern jobbar övriga dagar.
 *   Planen vet inte vilka veckodagar, så två sådana samtidigt räknas också som delvis.
 * - gap: ingen förälder är ledig.
 */
export const coverageSegments = (
  periods: ParentalPeriod[],
  birthDate: string
): CoverageSegment[] => {
  if (periods.length === 0) return [];

  const first = Math.min(toDayNumber(birthDate), ...periods.map((p) => toDayNumber(p.start)));
  const last = Math.max(...periods.map((p) => toDayNumber(periodEnd(p))));
  // 0 = lucka, 1 = delvis, 2 = full
  const status = new Array<number>(last - first + 1).fill(0);

  for (const period of periods) {
    const level = period.daysPerWeek < 5 && period.worksOtherDays ? 1 : 2;
    const from = toDayNumber(period.start) - first;
    const to = toDayNumber(periodEnd(period)) - first;
    for (let d = from; d <= to; d++) status[d] = Math.max(status[d], level);
  }

  const names: Coverage[] = ["gap", "partial", "full"];
  const segments: CoverageSegment[] = [];
  let segmentStart = 0;

  for (let d = 1; d <= status.length; d++) {
    if (d === status.length || status[d] !== status[segmentStart]) {
      segments.push({
        start: fromDayNumber(first + segmentStart),
        end: fromDayNumber(first + d - 1),
        coverage: names[status[segmentStart]],
      });
      segmentStart = d;
    }
  }

  return segments;
};

/** Antal dagar i ett avsnitt (inklusive start och slut). */
export const segmentDays = (segment: { start: string; end: string }) =>
  toDayNumber(segment.end) - toDayNumber(segment.start) + 1;
