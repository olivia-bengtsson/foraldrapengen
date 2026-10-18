// Referenstest (golden master) för belopp. Jämför beräknade belopp för startläget och
// exemplen med src/utils/__fixtures__/amounts.json.
//
// Generera om referensfilen ENDAST när en ändring avsiktligt ändrar belopp:
//   UPDATE_FIXTURE=1 CI=true npm test -- amounts
// Fallerar testet utan att belopp ska ändras är det ett fel i koden, inte i filen.

import fs from "fs";
import path from "path";
import { Parent } from "../types";
import { createExamples, createInitialParents } from "../constants";
import { calculateParentBenefits, getMonthlyIncomeForParent } from "./calculations";
import { dateParts, fromDayNumber, toDayNumber } from "./dates";
import { periodEnd } from "./periodHelpers";

const FIXTURE = path.join(__dirname, "__fixtures__", "amounts.json");
const START = "2026-03-16";
const TAX_RATES = [0.3, 0.32];

type Amounts = Record<string, number | string>;

const plans: Record<string, { parents: Parent[]; numParents: 1 | 2 }> = {
  initial: { parents: createInitialParents(START), numParents: 2 },
  ...Object.fromEntries(
    Object.entries(createExamples(START)).map(([key, example]) => [
      key,
      {
        parents: example.parents as Parent[],
        numParents: (example.parents.length === 1 ? 1 : 2) as 1 | 2,
      },
    ])
  ),
};

const monthsOfPlan = (parents: Parent[]): Array<[number, number]> => {
  const days = parents.flatMap((p) =>
    p.periods.flatMap((period) => [toDayNumber(period.start), toDayNumber(periodEnd(period))])
  );
  const first = dateParts(fromDayNumber(Math.min(...days)));
  const last = dateParts(fromDayNumber(Math.max(...days)));
  const months: Array<[number, number]> = [];
  for (let i = first.year * 12 + first.month; i <= last.year * 12 + last.month; i++) {
    months.push([Math.floor(i / 12), i % 12]);
  }
  return months;
};

const computeAmounts = () => {
  const result: Record<string, Amounts[]> = {};

  for (const [name, { parents, numParents }] of Object.entries(plans)) {
    const active = parents.slice(0, numParents);
    const months = monthsOfPlan(active);

    for (const taxRate of TAX_RATES) {
      const rows: Amounts[] = [];
      for (const parent of active) {
        // monthsNeeded är ingen summa i kronor och ingår inte (ändrades i A11)
        const { monthsNeeded, ...benefits } = calculateParentBenefits(parent, taxRate);
        rows.push({ parent: parent.name, ...benefits } as Amounts);

        for (const [year, month] of months) {
          const income = getMonthlyIncomeForParent(parent, benefits as never, year, month, taxRate);
          rows.push({ parent: parent.name, month: `${year}-${month + 1}`, ...income });
        }
      }
      result[`${name} @ ${taxRate}`] = rows;
    }
  }

  return result;
};

test("belopp stämmer med referensfilen", () => {
  const actual = computeAmounts();

  if (process.env.UPDATE_FIXTURE === "1") {
    fs.writeFileSync(FIXTURE, JSON.stringify(actual, null, 2) + "\n");
    return;
  }

  const expected: Record<string, Amounts[]> = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());

  // Alla avvikelser samlas, så att felutskriften visar vilka belopp som ändrats
  const differences: string[] = [];
  for (const [key, rows] of Object.entries(expected)) {
    expect(actual[key]).toHaveLength(rows.length);
    rows.forEach((row, i) => {
      for (const [field, value] of Object.entries(row)) {
        const got = actual[key][i][field];
        const same =
          typeof value === "number" && typeof got === "number"
            ? Math.abs(got - value) < 1e-6
            : got === value;
        if (!same) {
          differences.push(`${key} · ${row.month ?? "totalt"} · ${row.parent} · ${field}: ${value} → ${got}`);
        }
      }
    });
  }

  expect(differences).toEqual([]);
});
