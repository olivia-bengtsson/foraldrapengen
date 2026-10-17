// Konstanter och exempeldata för kalkylatorn

import { ParentalPeriod } from "../types";
import { generatePeriodId } from "../utils/periodHelpers";
import { addDays, todayDate } from "../utils/dates";

// Försäkringskassan länkar
export { FK_LINKS } from "./FkLinks";

// Regler och belopp finns i src/rules/.

// Datum räknas en gång när modulen laddas, med start från dagens datum
const today = todayDate();

/** Period på sjukpenningnivå som börjar startWeek veckor efter idag. */
const examplePeriod = (
  startWeek: number,
  weeks: number,
  daysPerWeek: number
): ParentalPeriod => ({
  id: generatePeriodId(),
  start: addDays(today, startWeek * 7),
  weeks,
  daysPerWeek,
  level: "high",
});

// Exempel-scenarier (med dynamiska datum baserade på dagens datum)
export const EXAMPLES = {
  maxTime: {
    name: "Maximera tid med barnet",
    description:
      "Dela jämnt, ta ledigt 5 dagar/vecka för längsta möjliga tid hemma",
    parents: [
      {
        id: 1,
        name: "Förälder 1",
        type: "employed" as const,
        monthlySalary: 35000,
        employerTopUp: 10,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(0, 48, 5), // 240 dagar
        ],
      },
      {
        id: 2,
        name: "Förälder 2",
        type: "employed" as const,
        monthlySalary: 35000,
        employerTopUp: 10,
        employerTopUpDays: 360,
        periods: [
          examplePeriod(48, 48, 5), // 240 dagar
        ],
      },
    ],
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
          examplePeriod(0, 34, 7), // 238 dagar
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
          examplePeriod(34, 34, 7), // 238 dagar
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
          examplePeriod(69, 27, 5), // 135 dagar, efter förälder 1:s andra period
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
          examplePeriod(0, 96, 5), // 480 dagar
        ],
      },
    ],
  },
};

export type ExampleKey = keyof typeof EXAMPLES;
