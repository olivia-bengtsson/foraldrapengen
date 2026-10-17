// Konstanter och exempeldata för kalkylatorn

import { generatePeriodId, getDateAfterDays } from "../utils/periodHelpers";
import { addDays, todayDate } from "../utils/dates";

// Försäkringskassan länkar
export { FK_LINKS } from "./FkLinks";

// Regler och belopp finns i src/rules/.

// Calculate dates once at module load
const today = todayDate();
const endDate1 = getDateAfterDays(today, 240, 5);
const startDate2 = addDays(endDate1, 1);
const endDate2 = getDateAfterDays(startDate2, 240, 5);

const endDateMoney1 = getDateAfterDays(today, 240, 7);
const startDateMoney2 = addDays(endDateMoney1, 1);
const endDateMoney2 = getDateAfterDays(startDateMoney2, 240, 7);

const endDateSingle = getDateAfterDays(today, 480, 5);

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
          {
            id: generatePeriodId(),
            daysToTake: 240,
            daysPerWeek: 5,
            startDate: today,
            endDate: endDate1,
          },
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
          {
            id: generatePeriodId(),
            daysToTake: 240,
            daysPerWeek: 5,
            startDate: startDate2,
            endDate: endDate2,
          },
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
          {
            id: generatePeriodId(),
            daysToTake: 240,
            daysPerWeek: 7,
            startDate: today,
            endDate: endDateMoney1,
          },
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
          {
            id: generatePeriodId(),
            daysToTake: 240,
            daysPerWeek: 7,
            startDate: startDateMoney2,
            endDate: endDateMoney2,
          },
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
          {
            id: generatePeriodId(),
            daysToTake: 105,
            daysPerWeek: 5,
            startDate: today,
            endDate: getDateAfterDays(today, 105, 5),
          },
          {
            id: generatePeriodId(),
            daysToTake: 105,
            daysPerWeek: 5,
            startDate: getDateAfterDays(
              getDateAfterDays(today, 105, 5),
              105,
              5,
            ), // After parent 2's first period
            endDate: getDateAfterDays(
              getDateAfterDays(getDateAfterDays(today, 105, 5), 105, 5),
              105,
              5,
            ),
          },
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
          {
            id: generatePeriodId(),
            daysToTake: 135,
            daysPerWeek: 5,
            startDate: getDateAfterDays(today, 105, 5), // After parent 1's first period
            endDate: getDateAfterDays(getDateAfterDays(today, 105, 5), 135, 5),
          },
          {
            id: generatePeriodId(),
            daysToTake: 135,
            daysPerWeek: 5,
            startDate: getDateAfterDays(
              getDateAfterDays(getDateAfterDays(today, 105, 5), 105, 5),
              105,
              5,
            ), // After parent 1's second period
            endDate: getDateAfterDays(
              getDateAfterDays(
                getDateAfterDays(getDateAfterDays(today, 105, 5), 105, 5),
                105,
                5,
              ),
              135,
              5,
            ),
          },
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
          {
            id: generatePeriodId(),
            daysToTake: 480,
            daysPerWeek: 5,
            startDate: today,
            endDate: endDateSingle,
          },
        ],
      },
    ],
  },
};

export type ExampleKey = keyof typeof EXAMPLES;
