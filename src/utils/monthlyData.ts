// Månadstabellen: inkomst per månad och förälder från planens första till sista dag.

import { MonthlyData, Parent, ParentBenefits } from "../types";
import { getMonthlyIncomeForParent } from "./calculations";
import { dateParts, fromDayNumber, toDayNumber } from "./dates";
import { periodEnd } from "./periodHelpers";

export const buildMonthlyData = (
  parents: Parent[],
  numParents: 1 | 2,
  parentResults: ParentBenefits[],
  taxRate: number
): MonthlyData[] => {
  const allDays = parents
    .slice(0, numParents)
    .flatMap((p) =>
      p.periods.flatMap((period) => [
        toDayNumber(period.start),
        toDayNumber(periodEnd(period)),
      ])
    )
    .filter((day) => !isNaN(day));

  if (allDays.length === 0) return [];

  const first = dateParts(fromDayNumber(Math.min(...allDays)));
  const last = dateParts(fromDayNumber(Math.max(...allDays)));
  const months: MonthlyData[] = [];

  for (
    let index = first.year * 12 + first.month;
    index <= last.year * 12 + last.month;
    index++
  ) {
    const year = Math.floor(index / 12);
    const month = index % 12;

    const parent1 = getMonthlyIncomeForParent(parents[0], parentResults[0], year, month, taxRate);
    const parent2 =
      numParents === 2
        ? getMonthlyIncomeForParent(parents[1], parentResults[1], year, month, taxRate)
        : undefined;

    months.push({
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      parent1Total: parent1.total,
      parent2Total: parent2?.total,
      parent1Days: parent1.days,
      parent2Days: parent2?.days,
      parent1HighDays: parent1.highDays,
      parent1LowDays: parent1.lowDays,
      parent2HighDays: parent2?.highDays,
      parent2LowDays: parent2?.lowDays,
    });
  }

  return months;
};
