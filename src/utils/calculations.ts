// Beräkningslogik för föräldrapengen

import { Parent, ParentBenefits } from "../types";
import { getTotalDaysFromPeriods } from "./periodHelpers";

// Konstanter för 2025
const MAX_SGI = 588000; // 10 prisbasbelopp för 2025
const MIN_SGI = 14100; // 24% av prisbasbelopp för 2025
const DEFAULT_TAX_RATE = 0.3; // Standardskatt för föräldrapenning som sidoinkomst
const LOW_LEVEL_DAILY_BENEFIT = 180; // Lågnivådagar

/**
 * Beräknar SGI (Sjukpenninggrundande inkomst)
 * Inkluderar tak och golv enligt FK:s regler
 */
export const calculateSGI = (monthlySalary: number): number => {
  const yearlyIncome = monthlySalary * 12;
  const sgi = yearlyIncome * 0.97;

  // Applicera tak och golv
  if (sgi < MIN_SGI) {
    return 0; // Under minsta SGI = grundnivå
  }

  return Math.min(sgi, MAX_SGI); // Takad vid max SGI
};

/**
 * Beräknar dagersättning från FK
 * Max: 1259 kr/dag (vid max SGI)
 * Min: 250 kr/dag (grundnivå)
 */
export const calculateDailyBenefit = (sgi: number): number => {
  if (sgi === 0) {
    return 250; // Grundnivå om ingen SGI
  }

  const daily = (sgi * 0.8) / 365;
  return Math.min(Math.max(daily, 250), 1259);
};

/**
 * Beräknar skatt på dagersättning
 * @param dailyBenefit - Dagersättning före skatt
 * @param taxRate - Skattesats (0-1), t.ex. 0.30 för 30%
 */
export const calculateTax = (
  dailyBenefit: number,
  taxRate: number = DEFAULT_TAX_RATE
): number => {
  return dailyBenefit * taxRate;
};

/**
 * Räknar antal dagar mellan två datum
 */
export const getDaysBetweenDates = (
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Beräknar alla förmåner för en förälder
 * @param parent - Förälderns data
 * @param taxRate - Skattesats baserat på kommun (valfri, default 30%)
 */
export const calculateParentBenefits = (
  parent: Parent,
  taxRate: number = DEFAULT_TAX_RATE
): ParentBenefits => {
  const sgi = calculateSGI(parent.monthlySalary);
  const dailyBenefit = calculateDailyBenefit(sgi);

  // Get total days from all periods
  const totalDays = getTotalDaysFromPeriods(parent.periods);

  const reservedDays = 90;
  const transferableDays = Math.max(0, totalDays - reservedDays);

  const highLevelDays = Math.min(totalDays, 390);
  const lowLevelDays = Math.max(0, totalDays - 390);

  // Beräkna FK-ersättning före skatt
  const fkBenefitBeforeTax =
    highLevelDays * dailyBenefit + lowLevelDays * LOW_LEVEL_DAILY_BENEFIT;

  // Beräkna skatt med vald skattesats
  const tax = calculateTax(dailyBenefit, taxRate);

  // Beräkna lågnivå efter skatt med samma skattesats
  const lowLevelAfterTax = LOW_LEVEL_DAILY_BENEFIT * (1 - taxRate);

  // FK-ersättning efter skatt
  const fkBenefitAfterTax =
    highLevelDays * (dailyBenefit - tax) + lowLevelDays * lowLevelAfterTax;

  // Beräkna arbetsgivartillägg (PAG) - ska beskattas
  const employerTopUpBeforeTax =
    parent.type === "employed"
      ? (highLevelDays * dailyBenefit * parent.employerTopUp) / 100
      : 0;

  // PAG beskattas med samma skattesats
  const employerTopUpAfterTax = employerTopUpBeforeTax * (1 - taxRate);

  // Totala ersättningar
  const totalBenefitBeforeTax = fkBenefitBeforeTax + employerTopUpBeforeTax;
  const totalBenefitAfterTax = fkBenefitAfterTax + employerTopUpAfterTax;

  // Calculate total calendar days from all periods
  let totalCalendarDays = 0;
  for (const period of parent.periods) {
    const periodDays = getDaysBetweenDates(period.startDate, period.endDate);
    totalCalendarDays += periodDays;
  }
  const weeksNeeded = Math.ceil(totalCalendarDays / 7);

  const avgDailyBenefit = totalDays > 0 ? totalBenefitAfterTax / totalDays : 0;

  return {
    sgi,
    dailyBenefit,
    dailyBenefitAfterTax: dailyBenefit - tax,
    highLevelDays,
    lowLevelDays,
    reservedDays,
    transferableDays,
    fkBenefitBeforeTax,
    fkBenefitAfterTax,
    employerTopUpAmount: employerTopUpAfterTax,
    totalBenefitBeforeTax,
    totalBenefitAfterTax,
    weeksNeeded,
    monthsNeeded: weeksNeeded / 4.33,
    avgDailyBenefit,
    tax,
  };
};

/**
 * Beräknar månadsinkomst för en given månad och förälder
 */
export const getMonthlyIncomeForParent = (
  parent: Parent,
  benefits: ParentBenefits,
  year: number,
  month: number,
  taxRate: number = 0.3
): { total: number; days: number } => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  let totalDaysThisMonth = 0;
  let totalIncomeThisMonth = 0;

  // Loop through all periods to see if any fall within this month
  for (const period of parent.periods) {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    // If period overlaps with this month
    if (!(monthStart > endDate || monthEnd < startDate)) {
      // Calculate days in this month for this period
      const overlapStart = monthStart > startDate ? monthStart : startDate;
      const overlapEnd = monthEnd < endDate ? monthEnd : endDate;
      const daysInMonth =
        Math.ceil(
          (overlapEnd.getTime() - overlapStart.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1; // +1 to include both start and end day

      totalDaysThisMonth += daysInMonth;

      // Calculate income for these days
      const avgDaily = benefits.avgDailyBenefit;
      const incomeForPeriod = avgDaily * period.daysPerWeek * (daysInMonth / 7);
      totalIncomeThisMonth += incomeForPeriod;
    }
  }

  // If no leave days this month, return salary
  if (totalDaysThisMonth === 0) {
    const monthlySalaryAfterTax = parent.monthlySalary * (1 - taxRate);
    return { total: monthlySalaryAfterTax, days: 0 };
  }

  // Check if entire month is leave
  const daysInFullMonth = monthEnd.getDate();
  if (totalDaysThisMonth >= daysInFullMonth) {
    // Full month of leave
    return { total: totalIncomeThisMonth, days: totalDaysThisMonth };
  }

  // Partial month - combine work income and leave income
  const leaveDaysRatio = totalDaysThisMonth / daysInFullMonth;
  const workDaysRatio = 1 - leaveDaysRatio;

  const workIncome = parent.monthlySalary * (1 - taxRate) * workDaysRatio;
  const leaveIncome = totalIncomeThisMonth;

  return { total: workIncome + leaveIncome, days: totalDaysThisMonth };
};
