// Beräkningslogik för föräldrapengen

import { Parent, ParentBenefits } from "../types";

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

  const reservedDays = 90;
  const transferableDays = Math.max(0, parent.daysToTake - reservedDays);

  const highLevelDays = Math.min(parent.daysToTake, 390);
  const lowLevelDays = Math.max(0, parent.daysToTake - 390);

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

  const totalDays = getDaysBetweenDates(parent.startDate, parent.endDate);
  const weeksNeeded = Math.ceil(totalDays / 7);

  const avgDailyBenefit =
    parent.daysToTake > 0 ? totalBenefitAfterTax / parent.daysToTake : 0;

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
  month: number
): { total: number; days: number } => {
  const startDate = new Date(parent.startDate);
  const endDate = new Date(parent.endDate);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  // Om föräldern inte är ledig denna månad
  if (monthStart > endDate || monthEnd < startDate) {
    // Normal lön efter skatt (ca 70%)
    const monthlySalaryAfterTax = parent.monthlySalary * 0.7;
    return { total: monthlySalaryAfterTax, days: 0 };
  }

  // Räkna lediga dagar denna månad
  const overlapStart = monthStart > startDate ? monthStart : startDate;
  const overlapEnd = monthEnd < endDate ? monthEnd : endDate;
  const daysInMonth = Math.ceil(
    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Om helt ledig hela månaden
  if (overlapStart <= monthStart && overlapEnd >= monthEnd) {
    const avgDaily = benefits.avgDailyBenefit;
    return { total: avgDaily * parent.daysPerWeek * 4.33, days: daysInMonth };
  }

  // Delvis ledig - räkna ut proportionellt
  const daysInFullMonth = monthEnd.getDate();
  const workDaysRatio = (daysInFullMonth - daysInMonth) / daysInFullMonth;
  const leaveDaysRatio = daysInMonth / daysInFullMonth;

  const workIncome = parent.monthlySalary * 0.7 * workDaysRatio;
  const leaveIncome =
    benefits.avgDailyBenefit * parent.daysPerWeek * 4.33 * leaveDaysRatio;

  return { total: workIncome + leaveIncome, days: daysInMonth };
};
