// Types för föräldrapengen-kalkylatorn

export interface Parent {
  id: number;
  name: string;
  type: "employed" | "student";
  monthlySalary: number;
  employerTopUp: number;
  daysToTake: number;
  daysPerWeek: number;
  startDate: string;
  endDate: string;
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
}

export interface MonthlyData {
  month: string;
  parent1Total: number;
  parent1Days: number;
  parent2Total: number;
  parent2Days: number;
}

export type TabType = "calculator" | "info" | "examples";
