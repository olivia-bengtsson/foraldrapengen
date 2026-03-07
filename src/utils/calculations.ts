// Beräkningslogik för föräldrapengen

import { Parent, ParentBenefits, MonthlyIncomeResult } from "../types";
import { getTotalDaysFromPeriods } from "./periodHelpers";

// Konstanter för 2025/2026
const MAX_SGI = 592000; // 10 prisbasbelopp för 2026
const MIN_SGI = 14200; // 24% av prisbasbelopp för 2026
const DEFAULT_TAX_RATE = 0.3; // Standardskatt för föräldrapenning som sidoinkomst
const LOW_LEVEL_DAILY_BENEFIT = 180; // Lågnivådagar
const SGI_CEILING_MONTHLY = 49333; // SGI-tak per månad 2026

// Föräldrapenningsregler
export const PARENTAL_LEAVE_RULES = {
  TOTAL_DAYS: 480,
  DAYS_PER_PARENT: 240,
  RESERVED_DAYS_PER_PARENT: 90,
  TRANSFERABLE_DAYS_PER_PARENT: 150,
  HIGH_LEVEL_DAYS_TOTAL: 390,
  LOW_LEVEL_DAYS_TOTAL: 90,
  HIGH_LEVEL_DAYS_PER_PARENT: 195,
  LOW_LEVEL_DAYS_PER_PARENT: 45,
  MIN_HIGH_LEVEL_BEFORE_LOW: 180, // Första 180 dagarna MÅSTE vara högNivå
  MAX_DOUBLE_DAYS: 60,
  DOUBLE_DAYS_MAX_AGE_MONTHS: 15,
};

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

  // Räkna highLevel och lowLevel dagar baserat på period.level
  let highLevelDays = 0;
  let lowLevelDays = 0;

  for (const period of parent.periods) {
    const periodDays = period.daysToTake || 0;
    const level = period.level || "high"; // Default till högNivå

    if (level === "high") {
      highLevelDays += periodDays;
    } else if (level === "low") {
      lowLevelDays += periodDays;
    }
  }

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

  // Beräkna arbetsgivartillägg (PAG) - baserat på LÖN, inte dagersättning
  let employerTopUpBeforeTax = 0;

  if (parent.type === "employed" && parent.employerTopUp > 0) {
    const monthlySalary = parent.monthlySalary;
    const yearlySalary = monthlySalary * 12;

    // SGI-tak för 2026: 592 000 kr/år = 49 333 kr/mån
    const sgiCeilingMonthly = 49333;
    const sgiCeilingYearly = sgiCeilingMonthly * 12;

    // Begränsa PAG till max antal dagar från arbetsgivare
    const pagEligibleDays = Math.min(
      highLevelDays,
      parent.employerTopUpDays || 360
    );

    if (yearlySalary <= sgiCeilingYearly) {
      // Lön under taket: PAG = X% av hela lönen
      const yearlyPAG = yearlySalary * (parent.employerTopUp / 100);
      const dailyPAG = yearlyPAG / 365;
      employerTopUpBeforeTax = dailyPAG * pagEligibleDays;
    } else {
      // Lön över taket: 10% under tak, 90% över tak (vanligt i kollektivavtal)
      const underCeilingYearly = sgiCeilingYearly * 0.1; // 10% av lön under tak
      const overCeilingYearly = (yearlySalary - sgiCeilingYearly) * 0.9; // 90% av lön över tak
      const totalYearlyPAG = underCeilingYearly + overCeilingYearly;
      const dailyPAG = totalYearlyPAG / 365;
      employerTopUpBeforeTax = dailyPAG * pagEligibleDays;
    }
  }

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
 * Beräknar hur många PAG-dagar som redan förbrukats innan ett visst datum
 */
const calculateAccumulatedPAGDays = (
  parent: Parent,
  beforeDate: Date
): number => {
  let accumulatedDays = 0;

  // Sortera perioder kronologiskt
  const sortedPeriods = [...parent.periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  for (const period of sortedPeriods) {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    // Om perioden startar efter vårt datum, skippa
    if (periodStart >= beforeDate) {
      break;
    }

    // Om perioden är högNivå, räkna dagarna
    const level = period.level || "high";
    if (level === "high") {
      // Om perioden slutar före vårt datum, räkna alla dagar
      if (periodEnd < beforeDate) {
        accumulatedDays += period.daysToTake;
      } else {
        // Perioden pågår - räkna endast dagar fram till beforeDate
        const daysInPeriod =
          Math.ceil(
            (periodEnd.getTime() - periodStart.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;
        const daysUntilBeforeDate = Math.ceil(
          (beforeDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        const ratio = daysUntilBeforeDate / daysInPeriod;
        accumulatedDays += period.daysToTake * ratio;
      }
    }
  }

  return accumulatedDays;
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
): MonthlyIncomeResult => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  let totalDaysThisMonth = 0;
  let totalIncomeThisMonth = 0;
  let highLevelDaysThisMonth = 0; // För PAG-beräkning
  let lowLevelDaysThisMonth = 0; // För visuell indikering

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

      // Calculate income based on period level (high/low)
      const level = period.level || "high";
      let dailyBenefitAfterTax: number;
      const effectiveDays = period.daysPerWeek * (daysInMonth / 7);

      if (level === "low") {
        // Lägstanivå: 180 kr/dag efter skatt
        dailyBenefitAfterTax = LOW_LEVEL_DAILY_BENEFIT * (1 - taxRate);
        lowLevelDaysThisMonth += effectiveDays;
      } else {
        // Sjukpenningnivå: använd benefits.dailyBenefitAfterTax
        dailyBenefitAfterTax = benefits.dailyBenefitAfterTax;
        highLevelDaysThisMonth += effectiveDays;
      }

      // Beräkna inkomst för denna period
      const incomeForPeriod =
        dailyBenefitAfterTax * period.daysPerWeek * (daysInMonth / 7);
      totalIncomeThisMonth += incomeForPeriod;
    }
  }

  // Lägg till PAG om anställd och har högNivå-dagar denna månad
  if (
    parent.type === "employed" &&
    parent.employerTopUp > 0 &&
    highLevelDaysThisMonth > 0
  ) {
    const monthlySalary = parent.monthlySalary;
    const yearlySalary = monthlySalary * 12;
    const sgiCeilingYearly = SGI_CEILING_MONTHLY * 12;

    // Räkna ut hur många PAG-dagar som redan förbrukats före denna månad
    const monthStart = new Date(year, month, 1);
    const accumulatedPAGDays = calculateAccumulatedPAGDays(parent, monthStart);

    // Hur många PAG-dagar kan vi använda denna månad?
    const maxPAGDays = parent.employerTopUpDays || 360;
    const remainingPAGDays = Math.max(0, maxPAGDays - accumulatedPAGDays);
    const pagDaysThisMonth = Math.min(highLevelDaysThisMonth, remainingPAGDays);

    if (pagDaysThisMonth > 0) {
      let dailyPAG = 0;

      if (yearlySalary <= sgiCeilingYearly) {
        const yearlyPAG = yearlySalary * (parent.employerTopUp / 100);
        dailyPAG = yearlyPAG / 365;
      } else {
        const underCeilingYearly = sgiCeilingYearly * 0.1;
        const overCeilingYearly = (yearlySalary - sgiCeilingYearly) * 0.9;
        const totalYearlyPAG = underCeilingYearly + overCeilingYearly;
        dailyPAG = totalYearlyPAG / 365;
      }

      const pagAfterTax = dailyPAG * pagDaysThisMonth * (1 - taxRate);
      totalIncomeThisMonth += pagAfterTax;
    }
  }

  // If no leave days this month, return salary
  if (totalDaysThisMonth === 0) {
    const monthlySalaryAfterTax = parent.monthlySalary * (1 - taxRate);
    return { total: monthlySalaryAfterTax, days: 0, highDays: 0, lowDays: 0 };
  }

  // Check if entire month is leave
  const daysInFullMonth = monthEnd.getDate();
  if (totalDaysThisMonth >= daysInFullMonth) {
    // Full month of leave
    return {
      total: totalIncomeThisMonth,
      days: totalDaysThisMonth,
      highDays: highLevelDaysThisMonth,
      lowDays: lowLevelDaysThisMonth,
    };
  }

  // Partial month - combine work income and leave income
  const leaveDaysRatio = totalDaysThisMonth / daysInFullMonth;
  const workDaysRatio = 1 - leaveDaysRatio;

  const workIncome = parent.monthlySalary * (1 - taxRate) * workDaysRatio;
  const leaveIncome = totalIncomeThisMonth;

  return {
    total: workIncome + leaveIncome,
    days: totalDaysThisMonth,
    highDays: highLevelDaysThisMonth,
    lowDays: lowLevelDaysThisMonth,
  };
};

/**
 * VALIDERING: Kontrollera totala dagar för båda föräldrar
 */
export interface DaysValidation {
  isValid: boolean;
  totalDays: number;
  exceededDays: number;
  warnings: string[];
}

export const validateTotalDays = (
  parents: Parent[],
  numParents: 1 | 2
): DaysValidation => {
  const warnings: string[] = [];

  const parent1Days = getTotalDaysFromPeriods(parents[0]?.periods || []);
  const parent2Days =
    numParents === 2 ? getTotalDaysFromPeriods(parents[1]?.periods || []) : 0;

  const totalDays = parent1Days + parent2Days;
  const exceededDays = Math.max(0, totalDays - PARENTAL_LEAVE_RULES.TOTAL_DAYS);

  if (exceededDays > 0) {
    warnings.push(
      `Totalt antal dagar (${totalDays}) överstiger maxgränsen på ${PARENTAL_LEAVE_RULES.TOTAL_DAYS} dagar. ` +
        `Du planerar ${exceededDays} dagar för mycket.`
    );
  }

  return {
    isValid: exceededDays === 0,
    totalDays,
    exceededDays,
    warnings,
  };
};

/**
 * VALIDERING: Kontrollera reserverade dagar
 */
export const validateReservedDays = (
  parents: Parent[],
  numParents: 1 | 2
): DaysValidation => {
  const warnings: string[] = [];

  if (numParents === 1) {
    return { isValid: true, totalDays: 0, exceededDays: 0, warnings: [] };
  }

  const parent1Days = getTotalDaysFromPeriods(parents[0]?.periods || []);
  const parent2Days = getTotalDaysFromPeriods(parents[1]?.periods || []);

  // Varje förälder måste ta minst 90 dagar
  if (parent1Days < PARENTAL_LEAVE_RULES.RESERVED_DAYS_PER_PARENT) {
    warnings.push(
      `Förälder 1 har endast ${parent1Days} dagar. Varje förälder måste ta minst ${PARENTAL_LEAVE_RULES.RESERVED_DAYS_PER_PARENT} reserverade dagar.`
    );
  }

  if (parent2Days < PARENTAL_LEAVE_RULES.RESERVED_DAYS_PER_PARENT) {
    warnings.push(
      `Förälder 2 har endast ${parent2Days} dagar. Varje förälder måste ta minst ${PARENTAL_LEAVE_RULES.RESERVED_DAYS_PER_PARENT} reserverade dagar.`
    );
  }

  // Kontrollera att inte mer än 150 dagar förs över
  const parent1Transferred = PARENTAL_LEAVE_RULES.DAYS_PER_PARENT - parent1Days;
  const parent2Transferred = PARENTAL_LEAVE_RULES.DAYS_PER_PARENT - parent2Days;

  if (parent1Transferred > PARENTAL_LEAVE_RULES.TRANSFERABLE_DAYS_PER_PARENT) {
    warnings.push(
      `Förälder 1 försöker föra över ${parent1Transferred} dagar, men max ${PARENTAL_LEAVE_RULES.TRANSFERABLE_DAYS_PER_PARENT} dagar kan föras över.`
    );
  }

  if (parent2Transferred > PARENTAL_LEAVE_RULES.TRANSFERABLE_DAYS_PER_PARENT) {
    warnings.push(
      `Förälder 2 försöker föra över ${parent2Transferred} dagar, men max ${PARENTAL_LEAVE_RULES.TRANSFERABLE_DAYS_PER_PARENT} dagar kan föras över.`
    );
  }

  return {
    isValid: warnings.length === 0,
    totalDays: parent1Days + parent2Days,
    exceededDays: 0,
    warnings,
  };
};

/**
 * VALIDERING: Kontrollera lägstanivådagar-regeln
 * De första 180 dagarna som tas ut för barnet MÅSTE vara sjukpenningnivå
 */
export const validateLowLevelDaysRule = (
  parents: Parent[],
  numParents: 1 | 2
): DaysValidation => {
  const warnings: string[] = [];

  // Räkna totala högNivå-dagar för alla föräldrar
  let totalHighLevelDays = 0;
  let hasLowLevelDays = false;

  for (let i = 0; i < numParents; i++) {
    const parent = parents[i];
    if (!parent || !parent.periods) continue;

    for (const period of parent.periods) {
      const level = period.level || "high"; // Default till högNivå
      const days = period.daysToTake || 0;

      if (level === "high") {
        totalHighLevelDays += days;
      } else if (level === "low") {
        hasLowLevelDays = true;
      }
    }
  }

  // Om det finns lågNivådagar men mindre än 180 högNivådagar totalt
  if (
    hasLowLevelDays &&
    totalHighLevelDays < PARENTAL_LEAVE_RULES.MIN_HIGH_LEVEL_BEFORE_LOW
  ) {
    const daysRemaining =
      PARENTAL_LEAVE_RULES.MIN_HIGH_LEVEL_BEFORE_LOW - totalHighLevelDays;
    warnings.push(
      `⚠️ De första 180 dagarna måste vara på sjukpenningnivå. ` +
        `Ni har tagit ${totalHighLevelDays} dagar på sjukpenningnivå. ` +
        `${daysRemaining} dagar kvar innan lägstanivådagar kan börja tas ut.`
    );
  }

  return {
    isValid: warnings.length === 0,
    totalDays: totalHighLevelDays,
    exceededDays: 0,
    warnings,
  };
};

/**
 * VALIDERING: Kontrollera dubbeldagar
 * Max 60 dubbeldagar, måste tas innan barnet fyller 15 månader
 */
export const validateDoubleDays = (
  parents: Parent[],
  numParents: 1 | 2,
  childBirthDate?: string
): DaysValidation => {
  const warnings: string[] = [];

  if (numParents !== 2) {
    return { isValid: true, totalDays: 0, exceededDays: 0, warnings: [] };
  }

  // Räkna totala dubbeldagar
  let totalDoubleDays = 0;

  for (let i = 0; i < numParents; i++) {
    const parent = parents[i];
    if (!parent || !parent.periods) continue;

    for (const period of parent.periods) {
      if (period.isDoubleDay) {
        const days = period.daysToTake || 0;

        // Kontrollera ålder om födelsedatum finns
        if (childBirthDate) {
          const birthDate = new Date(childBirthDate);
          const periodStart = new Date(period.startDate);

          // Beräkna barnets ålder i månader
          const monthsDiff =
            (periodStart.getFullYear() - birthDate.getFullYear()) * 12 +
            (periodStart.getMonth() - birthDate.getMonth());

          if (monthsDiff > PARENTAL_LEAVE_RULES.DOUBLE_DAYS_MAX_AGE_MONTHS) {
            warnings.push(
              `⚠️ Period "${period.id}" är en dubbeldag men barnet är ${monthsDiff} månader gammalt. ` +
                `Dubbeldagar kan endast tas ut innan barnet fyller ${PARENTAL_LEAVE_RULES.DOUBLE_DAYS_MAX_AGE_MONTHS} månader.`
            );
          }
        }

        totalDoubleDays += days;
      }
    }
  }

  // Eftersom en dubbeldag räknas per förälder, dela på 2 för att få faktiska dubbeldagar
  const actualDoubleDays = totalDoubleDays / 2;
  const exceededDays = Math.max(
    0,
    actualDoubleDays - PARENTAL_LEAVE_RULES.MAX_DOUBLE_DAYS
  );

  if (exceededDays > 0) {
    warnings.push(
      `⚠️ Du har planerat ${actualDoubleDays} dubbeldagar, men max ${PARENTAL_LEAVE_RULES.MAX_DOUBLE_DAYS} dubbeldagar tillåts. ` +
        `Du har ${exceededDays} för många dubbeldagar.`
    );
  }

  return {
    isValid: warnings.length === 0,
    totalDays: actualDoubleDays,
    exceededDays,
    warnings,
  };
};

/**
 * Kör alla valideringar
 */
export const validateAllRules = (
  parents: Parent[],
  numParents: 1 | 2,
  childBirthDate?: string
): {
  isValid: boolean;
  validations: {
    totalDays: DaysValidation;
    reservedDays: DaysValidation;
    lowLevelDays: DaysValidation;
    doubleDays: DaysValidation;
  };
  allWarnings: string[];
} => {
  const totalDays = validateTotalDays(parents, numParents);
  const reservedDays = validateReservedDays(parents, numParents);
  const lowLevelDays = validateLowLevelDaysRule(parents, numParents);
  const doubleDays = validateDoubleDays(parents, numParents, childBirthDate);

  const allWarnings = [
    ...totalDays.warnings,
    ...reservedDays.warnings,
    ...lowLevelDays.warnings,
    ...doubleDays.warnings,
  ];

  const isValid =
    totalDays.isValid &&
    reservedDays.isValid &&
    lowLevelDays.isValid &&
    doubleDays.isValid;

  return {
    isValid,
    validations: {
      totalDays,
      reservedDays,
      lowLevelDays,
      doubleDays,
    },
    allWarnings,
  };
};
