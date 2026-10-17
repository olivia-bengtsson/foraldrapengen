// Konstanter och exempeldata för kalkylatorn

import { generatePeriodId } from "../utils/periodHelpers";

// Försäkringskassan länkar
export { FK_LINKS } from "./FkLinks";

// Regler och belopp finns i src/rules/.

// Helper function to generate dates dynamically (with error handling)
const getTodayDate = () => {
  try {
    return new Date().toISOString().split("T")[0];
  } catch (error) {
    console.error("Error getting today date:", error);
    return "2026-01-06"; // Fallback
  }
};

const getDateAfterDays = (
  startDate: string,
  days: number,
  daysPerWeek: number,
) => {
  try {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return getTodayDate();
    }
    const totalDays = Math.ceil((days * 7) / daysPerWeek);
    start.setDate(start.getDate() + totalDays);
    return start.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error calculating date:", error);
    return getTodayDate();
  }
};

// Calculate dates once at module load
const today = getTodayDate();
const endDate1 = getDateAfterDays(today, 240, 5);
const startDate2Temp = new Date(endDate1);
startDate2Temp.setDate(startDate2Temp.getDate() + 1);
const startDate2 = startDate2Temp.toISOString().split("T")[0];
const endDate2 = getDateAfterDays(startDate2, 240, 5);

const endDateMoney1 = getDateAfterDays(today, 240, 7);
const startDateMoney2Temp = new Date(endDateMoney1);
startDateMoney2Temp.setDate(startDateMoney2Temp.getDate() + 1);
const startDateMoney2 = startDateMoney2Temp.toISOString().split("T")[0];
const endDateMoney2 = getDateAfterDays(startDateMoney2, 240, 7);

const endDateBalanced1 = getDateAfterDays(today, 210, 6);
const startDateBalanced2Temp = new Date(endDateBalanced1);
startDateBalanced2Temp.setDate(startDateBalanced2Temp.getDate() + 1);

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
