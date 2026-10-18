// Snabbstart: översätter några enkla svar till perioder (docs/PLANERARE.md).

import { Parent, ParentalPeriod } from "../types";
import { DEFAULT_TOP_UP, RULES } from "../rules";
import { addDays, toDayNumber } from "./dates";
import {
  generatePeriodId,
  getOverlaps,
  monthsFromWeeks,
  periodEnd,
  weeksFromMonths,
} from "./periodHelpers";

const DAYS = RULES.days;

export type DaysPerWeekOption = 5 | 6 | 7;
export type TogetherWeeksOption = 0 | 2 | 4 | 8;

export interface QuickStartAnswers {
  numParents: 1 | 2;
  birthDate: string;
  /** Vem är hemma först (index i parents) */
  first: 0 | 1;
  /** Månader hemma per förälder, steg 0,5 */
  months: [number, number];
  daysPerWeek: DaysPerWeekOption;
  /** Veckor hemma tillsammans i början (bara två föräldrar) */
  togetherWeeks: TogetherWeeksOption;
  salaries: [number, number];
  /** Föräldralön från arbetsgivaren */
  topUp: [boolean, boolean];
}

export const QUICK_START = {
  maxMonthsTwoParents: 16,
  maxMonthsOneParent: 18,
  monthStep: 0.5,
  daysPerWeekOptions: [5, 6, 7] as DaysPerWeekOption[],
  togetherWeeksOptions: [0, 2, 4, 8] as TogetherWeeksOption[],
  /** Tillsammans-perioden tas ut 5 dagar/vecka */
  togetherDaysPerWeek: 5,
};

export type QuickStartPresetKey = "equal" | "longest" | "moreMoney";

/** Förval i Snabbstart. Ersätter exempelfliken (Fas 3, punkt 18). */
export const QUICK_START_PRESETS: Record<
  QuickStartPresetKey,
  Pick<QuickStartAnswers, "numParents" | "months" | "daysPerWeek" | "togetherWeeks">
> = {
  equal: { numParents: 2, months: [9, 9], daysPerWeek: 5, togetherWeeks: 2 },
  longest: { numParents: 2, months: [11, 11], daysPerWeek: 5, togetherWeeks: 0 },
  moreMoney: { numParents: 2, months: [6, 6], daysPerWeek: 7, togetherWeeks: 0 },
};

/** Fälten för föräldralön från kryssrutan i Snabbstart */
export const topUpFields = (enabled: boolean) =>
  enabled
    ? { ...DEFAULT_TOP_UP }
    : { topUpUnderCeilingPercent: 0, topUpOverCeilingPercent: 0, topUpDays: DEFAULT_TOP_UP.topUpDays };

/**
 * Genererar perioder ur Snabbstart-svaren:
 * - Tillsammans-perioden läggs på föräldern som börjar sedan, från födseln, 5 dagar/vecka.
 * - Föräldern som börjar får sin tid från födseln, den andra tar över dagen efter.
 * - Dagarna fördelas i tidsordning: först sjukpenningnivå, sedan lägstanivå. Perioden delas
 *   i två när nivån byter. Upp till 90 sjukpenningdagar sparas åt den andra föräldern.
 * - Dagar som inte ryms i 390/90 läggs ändå in (på sjukpenningnivå), så att planen syns
 *   som för lång.
 * Namn och anställningsform behålls från parents. Förälder 2 lämnas orörd för en förälder.
 */
export const generatePlan = (answers: QuickStartAnswers, parents: Parent[]): Parent[] => {
  const two = answers.numParents === 2;
  const first = two ? answers.first : 0;
  const second = (1 - first) as 0 | 1;
  const dpw = answers.daysPerWeek;
  const periods: ParentalPeriod[][] = [[], []];

  let high: number = DAYS.highLevelTotal;
  let low: number = DAYS.lowLevelTotal;

  const add = (
    parent: 0 | 1,
    start: string,
    weeks: number,
    daysPerWeek: number,
    level: ParentalPeriod["level"]
  ) => {
    periods[parent].push({
      id: generatePeriodId(),
      start,
      weeks,
      daysPerWeek,
      level,
      worksOtherDays: false,
    });
    if (level === "high") high -= weeks * daysPerWeek;
    else low -= weeks * daysPerWeek;
    return addDays(start, weeks * 7);
  };

  /** Fyller weeks veckor från start i tidsordning. Returnerar dagen efter sista perioden. */
  const fill = (parent: 0 | 1, start: string, weeks: number, highCap: number): string => {
    let next = start;
    let rest = weeks;

    const highWeeks = Math.min(rest, Math.max(0, Math.floor(highCap / dpw)));
    if (highWeeks > 0) {
      next = add(parent, next, highWeeks, dpw, "high");
      rest -= highWeeks;
    }

    const lowWeeks = Math.min(rest, Math.max(0, Math.floor(low / dpw)));
    if (lowWeeks > 0) {
      next = add(parent, next, lowWeeks, dpw, "low");
      rest -= lowWeeks;
    }

    // För lång plan: resten på sjukpenningnivå, så att mätarna visar hur mycket för mycket
    if (rest > 0) next = add(parent, next, rest, dpw, "high");

    return next;
  };

  const togetherWeeks = two ? answers.togetherWeeks : 0;
  const togetherEnd =
    togetherWeeks > 0
      ? add(second, answers.birthDate, togetherWeeks, QUICK_START.togetherDaysPerWeek, "high")
      : answers.birthDate;

  const firstWeeks = weeksFromMonths(answers.months[first]);
  const secondWeeks = two ? weeksFromMonths(answers.months[second]) : 0;
  const keepForSecond = two ? Math.min(DAYS.reservedPerParent, secondWeeks * dpw) : 0;

  const afterFirst = fill(first, answers.birthDate, firstWeeks, high - keepForSecond);

  if (two && secondWeeks > 0) {
    // Den andra tar över dagen efter, men aldrig under sin egen tillsammans-period
    const start = afterFirst > togetherEnd ? afterFirst : togetherEnd;
    fill(second, start, secondWeeks, high);
  }

  return parents.map((parent, i) =>
    i < answers.numParents
      ? {
          ...parent,
          monthlySalary: answers.salaries[i],
          ...topUpFields(answers.topUp[i]),
          periods: periods[i],
        }
      : parent
  );
};

const clampMonths = (months: number, max: number) =>
  Math.min(max, Math.max(0, Math.round(months / QUICK_START.monthStep) * QUICK_START.monthStep));

const closest = <T extends number>(options: T[], value: number): T =>
  options.reduce((best, option) =>
    Math.abs(option - value) < Math.abs(best - value) ? option : best
  );

/** Förifyllda Snabbstart-svar från en befintlig plan. Ändrar inte planen. */
export const answersFromPlan = (
  parents: Parent[],
  numParents: 1 | 2,
  birthDate: string
): QuickStartAnswers => {
  const two = numParents === 2;
  const maxMonths = two ? QUICK_START.maxMonthsTwoParents : QUICK_START.maxMonthsOneParent;
  const together = two ? getOverlaps(parents[0].periods, parents[1].periods)[0] : undefined;
  const togetherWeeks =
    together && together.start === birthDate
      ? closest(QUICK_START.togetherWeeksOptions, together.days / QUICK_START.togetherDaysPerWeek)
      : 0;

  // Den som börjar är den med tidigast start. Börjar båda vid födseln (tillsammans-perioden)
  // är det den vars första period räcker längst.
  const firstPeriodOf = (parent: Parent) =>
    [...parent.periods].sort(
      (a, b) => a.start.localeCompare(b.start) || toDayNumber(periodEnd(b)) - toDayNumber(periodEnd(a))
    )[0];
  const startsEarlier = (a: Parent, b: Parent) => {
    const pa = firstPeriodOf(a);
    const pb = firstPeriodOf(b);
    if (!pa) return false;
    if (!pb) return true;
    return (
      pa.start < pb.start ||
      (pa.start === pb.start && toDayNumber(periodEnd(pa)) > toDayNumber(periodEnd(pb)))
    );
  };
  const first: 0 | 1 = two && startsEarlier(parents[1], parents[0]) ? 1 : 0;
  const leading = firstPeriodOf(parents[first]);
  const daysPerWeek = leading ? closest(QUICK_START.daysPerWeekOptions, leading.daysPerWeek) : 5;

  // Tillsammans-veckorna räknas inte in i den andra förälderns månader
  const monthsOf = (parent: Parent, i: number) => {
    const weeks = parent.periods.reduce((sum, p) => sum + p.weeks, 0);
    const together = two && i !== first ? togetherWeeks : 0;
    return clampMonths(monthsFromWeeks(Math.max(0, weeks - together)), maxMonths);
  };
  const hasTopUp = (parent: Parent) =>
    parent.topUpUnderCeilingPercent > 0 || parent.topUpOverCeilingPercent > 0;

  return {
    numParents,
    birthDate,
    first,
    months: [monthsOf(parents[0], 0), monthsOf(parents[1], 1)],
    daysPerWeek,
    togetherWeeks,
    salaries: [parents[0].monthlySalary, parents[1].monthlySalary],
    topUp: [hasTopUp(parents[0]), hasTopUp(parents[1])],
  };
};
