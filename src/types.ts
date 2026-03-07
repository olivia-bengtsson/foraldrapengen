// Period interface for multiple leave periods per parent
export interface ParentalPeriod {
  id: string;
  startDate: string;
  endDate: string;
  daysToTake: number;
  daysPerWeek: number;
  level?: "high" | "low"; // Sjukpenningnivå eller lägstanivå (default: high)
  isDoubleDay?: boolean; // Om detta är en dubbeldag (båda föräldrar samtidigt)
}

export interface Parent {
  id: number;
  name: string;
  type: "employed" | "self_employed" | "unemployed";
  monthlySalary: number;
  employerTopUp: number;
  employerTopUpDays: number; // Antal dagar arbetsgivartillägg betalas (vanligt 180-360)
  periods: ParentalPeriod[]; // Array of periods
}

export interface ParentBenefits {
  sgi: number;
  dailyBenefit: number;
  dailyBenefitAfterTax: number;
  highLevelDays: number;
  lowLevelDays: number;
  reservedDays: number;
  transferableDays: number;
  fkBenefitBeforeTax: number;
  fkBenefitAfterTax: number;
  employerTopUpAmount: number;
  totalBenefitBeforeTax: number;
  totalBenefitAfterTax: number;
  weeksNeeded: number;
  monthsNeeded: number;
  avgDailyBenefit: number;
  tax: number;

  // Legacy fields for backward compatibility
  benefitBeforeTax?: number;
  benefitAfterTax?: number;
  taxAmount?: number;
  totalIncomeAfterTax?: number;
}

export interface MonthlyData {
  month: string;
  parent1Total: number;
  parent1Days: number;
  parent1HighDays?: number; // Antal sjukpenningnivå-dagar
  parent1LowDays?: number; // Antal lägstanivå-dagar
  parent2Total?: number; // Optional for single parent
  parent2Days?: number; // Optional for single parent
  parent2HighDays?: number;
  parent2LowDays?: number;
}

export interface MonthlyIncomeResult {
  total: number;
  days: number;
  highDays: number;
  lowDays: number;
}

export type TabType = "calculator" | "info" | "examples";
