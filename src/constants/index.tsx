// Konstanter och exempeldata för kalkylatorn

import { Parent, ParentalPeriod } from "../types";
import { generatePeriodId } from "../utils/periodHelpers";
import { addDays, todayDate } from "../utils/dates";

// Försäkringskassan länkar
export { FK_LINKS } from "./FkLinks";

// Regler och belopp finns i src/rules/.

// Datum räknas en gång när modulen laddas, med start från dagens datum
const today = todayDate();

/** Period som börjar startWeek veckor efter startdatumet. */
const period = (
  start: string,
  startWeek: number,
  weeks: number,
  daysPerWeek: number,
  level: ParentalPeriod["level"] = "high"
): ParentalPeriod => ({
  id: generatePeriodId(),
  start: addDays(start, startWeek * 7),
  weeks,
  daysPerWeek,
  level,
});

const examplePeriod = (
  startWeek: number,
  weeks: number,
  daysPerWeek: number,
  level: ParentalPeriod["level"] = "high"
) => period(today, startWeek, weeks, daysPerWeek, level);

/**
 * Startläget: varje förälder tar sina 195 dagar på sjukpenningnivå (39 veckor) följt av
 * 45 dagar på lägstanivå (9 veckor), 5 dagar/vecka. Förälder 2 tar över dagen efter förälder 1.
 * Totalt 390 + 90 dagar (A1).
 */
export const createInitialParents = (start: string): Parent[] => [
  {
    id: 1,
    name: "Förälder 1",
    type: "employed",
    monthlySalary: 35000,
    employerTopUp: 10,
    employerTopUpDays: 360,
    periods: [period(start, 0, 39, 5, "high"), period(start, 39, 9, 5, "low")],
  },
  {
    id: 2,
    name: "Förälder 2",
    type: "employed",
    monthlySalary: 35000,
    employerTopUp: 10,
    employerTopUpDays: 360,
    periods: [period(start, 48, 39, 5, "high"), period(start, 87, 9, 5, "low")],
  },
];

// Exempel-scenarier (med dynamiska datum baserade på dagens datum)
export const EXAMPLES = {
  maxTime: {
    name: "Maximera tid med barnet",
    description:
      "Dela jämnt, ta ledigt 5 dagar/vecka för längsta möjliga tid hemma",
    parents: createInitialParents(today),
  },
  maxMoney: {
    name: "Maximera inkomst",
    description:
      "Högre lön, PAG-tillägg, ta ledigt 7 dagar/vecka för snabbast återgång till arbete",
    parents: [
      {
        id: 1,
        name: "Förälder 1",
        type: "employed" as const,
        monthlySalary: 45000,
        employerTopUp: 20,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(0, 27, 7), // 189 dagar
          examplePeriod(27, 6, 7, "low"), // 42 dagar
        ],
      },
      {
        id: 2,
        name: "Förälder 2",
        type: "employed" as const,
        monthlySalary: 45000,
        employerTopUp: 20,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(33, 27, 7), // 189 dagar
          examplePeriod(60, 6, 7, "low"), // 42 dagar
        ],
      },
    ],
  },
  balanced: {
    name: "Balanserat med växling",
    description:
      "Föräldrar växlar perioder - visar flera perioder per förälder",
    parents: [
      {
        id: 1,
        name: "Förälder 1",
        type: "employed" as const,
        monthlySalary: 38000,
        employerTopUp: 10,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(0, 21, 5), // 105 dagar
          examplePeriod(48, 21, 5), // 105 dagar, efter förälder 2:s första period
        ],
      },
      {
        id: 2,
        name: "Förälder 2",
        type: "employed" as const,
        monthlySalary: 32000,
        employerTopUp: 10,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(21, 27, 5), // 135 dagar, efter förälder 1:s första period
          examplePeriod(69, 9, 5), // 45 dagar, efter förälder 1:s andra period
          examplePeriod(78, 18, 5, "low"), // 90 dagar
        ],
      },
    ],
  },
  singleParent: {
    name: "Ensamförälder",
    description: "En förälder tar alla 480 dagar",
    parents: [
      {
        id: 1,
        name: "Förälder",
        type: "employed" as const,
        monthlySalary: 35000,
        employerTopUp: 10,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(0, 78, 5), // 390 dagar
          examplePeriod(78, 18, 5, "low"), // 90 dagar
        ],
      },
    ],
  },
};

export type ExampleKey = keyof typeof EXAMPLES;
