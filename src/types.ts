// Period interface for multiple leave periods per parent
export interface ParentalPeriod {
  id: string;
  startDate: string;
  endDate: string;
  daysToTake: number;
  daysPerWeek: number;
}

export interface Parent {
  id: number;
  name: string;
  type: "employed" | "self_employed" | "unemployed";
  monthlySalary: number;
  employerTopUp: number;
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
  parent2Total: number;
  parent2Days: number;
}

export type TabType = "calculator" | "info" | "examples";
