// Konstanter och exempeldata för kalkylatorn

import { Parent } from "../types";

// Försäkringskassan länkar
export { FK_LINKS } from "./FkLinks";

// Grundläggande föräldrapenning-regler
export const TOTAL_PARENTAL_DAYS = 480;
export const RESERVED_DAYS_PER_PARENT = 90;
export const HIGH_LEVEL_THRESHOLD = 390;
export const LOW_LEVEL_DAILY_AMOUNT = 180;
export const MIN_DAILY_BENEFIT = 250;
export const MAX_DAILY_BENEFIT = 1259; // Uppdaterat från 1250 till korrekt 1259 kr

// SGI-gränser för 2025
export const MAX_SGI_2025 = 588000; // 10 prisbasbelopp
export const MIN_SGI_2025 = 14100; // 24% av prisbasbelopp
export const PRISBASBELOPP_2025 = 58800;

// Skattesatser
export const STANDARD_TAX_RATE = 0.3; // Standard för föräldrapenning som sidoinkomst

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
  daysPerWeek: number
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
const startDateBalanced2 = startDateBalanced2Temp.toISOString().split("T")[0];
const endDateBalanced2 = getDateAfterDays(startDateBalanced2, 210, 5);

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
        daysToTake: 240,
        daysPerWeek: 5,
        startDate: today,
        endDate: endDate1,
      },
      {
        id: 2,
        name: "Förälder 2",
        type: "employed" as const,
        monthlySalary: 35000,
        employerTopUp: 10,
        daysToTake: 240,
        daysPerWeek: 5,
        startDate: startDate2,
        endDate: endDate2,
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
        daysToTake: 240,
        daysPerWeek: 7,
        startDate: today,
        endDate: endDateMoney1,
      },
      {
        id: 2,
        name: "Förälder 2",
        type: "employed" as const,
        monthlySalary: 45000,
        employerTopUp: 20,
        daysToTake: 240,
        daysPerWeek: 7,
        startDate: startDateMoney2,
        endDate: endDateMoney2,
      },
    ],
  },
  balanced: {
    name: "Balanserat",
    description:
      "Blanda 5 och 6 dagar/vecka, perioder överlappar för dubbeldagar",
    parents: [
      {
        id: 1,
        name: "Förälder 1",
        type: "employed" as const,
        monthlySalary: 38000,
        employerTopUp: 10,
        daysToTake: 210,
        daysPerWeek: 6,
        startDate: today,
        endDate: endDateBalanced1,
      },
      {
        id: 2,
        name: "Förälder 2",
        type: "employed" as const,
        monthlySalary: 32000,
        employerTopUp: 10,
        daysToTake: 210,
        daysPerWeek: 5,
        startDate: today, // Start same day to create overlap!
        endDate: endDateBalanced2,
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
        daysToTake: 480,
        daysPerWeek: 5,
        startDate: today,
        endDate: endDateSingle,
      },
    ],
  },
};

export type ExampleKey = keyof typeof EXAMPLES;
