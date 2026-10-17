// Beräkningslogik för föräldrapengen

import { Parent, ParentBenefits, MonthlyIncomeResult } from "../types";
import {
  getOverlaps,
  getTotalDaysFromPeriods,
  periodDays,
  periodEnd,
} from "./periodHelpers";
import {
  addMonths,
  addYears,
  diffDays,
  isValidDate,
  monthEndDay,
  monthStartDay,
  toDayNumber,
} from "./dates";
import { RULES } from "../rules";

const { sgi: SGI, benefit: BENEFIT, days: DAYS, employerTopUp: TOP_UP } = RULES;

// A8: ska bli RULES.tax.averageMunicipalRate (32,38 %). Behålls tills skattemodulen görs.
const DEFAULT_TAX_RATE = 0.3;
// A9: ska bli TOP_UP.typicalDays (180). Behålls tills föräldralönen rättas.
const DEFAULT_TOP_UP_DAYS = 360;
// Lön räknas på en arbetsvecka med 5 dagar
const WORK_DAYS_PER_WEEK = 5;

/**
 * Beräknar SGI (Sjukpenninggrundande inkomst)
 * Inkluderar tak och golv enligt FK:s regler
 */
export const calculateSGI = (monthlySalary: number): number => {
  const yearlyIncome = monthlySalary * 12;
  // A7: sgiFactor hör hemma i dagersättningsformeln, inte i SGI.
  const sgi = yearlyIncome * BENEFIT.sgiFactor;

  // Applicera tak och golv
  if (sgi < SGI.min) {
    return 0; // Under minsta SGI = grundnivå
  }

  return Math.min(sgi, SGI.max); // Takad vid max SGI
};

/**
 * Beräknar dagersättning från FK
 * Max: RULES.benefit.maxDaily (vid max SGI)
 * Min: RULES.benefit.basicDaily (grundnivå)
 */
export const calculateDailyBenefit = (sgi: number): number => {
  if (sgi === 0) {
    return BENEFIT.basicDaily; // Grundnivå om ingen SGI
  }

  const daily = (sgi * BENEFIT.rate) / 365;
  return Math.min(Math.max(daily, BENEFIT.basicDaily), BENEFIT.maxDaily);
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
  // A11: saknar +1, räknar inte med både start- och slutdag.
  return Math.abs(diffDays(startDate, endDate));
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

  const reservedDays = DAYS.reservedPerParent;
  const transferableDays = Math.max(0, totalDays - reservedDays);

  // Räkna highLevel och lowLevel dagar baserat på period.level
  let highLevelDays = 0;
  let lowLevelDays = 0;

  for (const period of parent.periods) {
    if (period.level === "high") {
      highLevelDays += periodDays(period);
    } else {
      lowLevelDays += periodDays(period);
    }
  }

  // Beräkna FK-ersättning före skatt
  const fkBenefitBeforeTax =
    highLevelDays * dailyBenefit + lowLevelDays * BENEFIT.lowLevelDaily;

  // Beräkna skatt med vald skattesats
  const tax = calculateTax(dailyBenefit, taxRate);

  // Beräkna lågnivå efter skatt med samma skattesats
  const lowLevelAfterTax = BENEFIT.lowLevelDaily * (1 - taxRate);

  // FK-ersättning efter skatt
  const fkBenefitAfterTax =
    highLevelDays * (dailyBenefit - tax) + lowLevelDays * lowLevelAfterTax;

  // Beräkna arbetsgivartillägg (PAG) - baserat på LÖN, inte dagersättning
  let employerTopUpBeforeTax = 0;

  if (parent.type === "employed" && parent.employerTopUp > 0) {
    const monthlySalary = parent.monthlySalary;
    const yearlySalary = monthlySalary * 12;

    const sgiCeilingYearly = SGI.max;

    // Begränsa PAG till max antal dagar från arbetsgivare
    const pagEligibleDays = Math.min(
      highLevelDays,
      parent.employerTopUpDays || DEFAULT_TOP_UP_DAYS
    );

    if (yearlySalary <= sgiCeilingYearly) {
      // Lön under taket: PAG = X% av hela lönen
      const yearlyPAG = yearlySalary * (parent.employerTopUp / 100);
      const dailyPAG = yearlyPAG / 365;
      employerTopUpBeforeTax = dailyPAG * pagEligibleDays;
    } else {
      // Lön över taket: 10% under tak, 90% över tak (vanligt i kollektivavtal)
      // A9: användarens procentsats ignoreras här.
      const underCeilingYearly = sgiCeilingYearly * TOP_UP.underCeilingRate;
      const overCeilingYearly =
        (yearlySalary - sgiCeilingYearly) * TOP_UP.overCeilingRate;
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

  const weeksNeeded = parent.periods.reduce((sum, p) => sum + p.weeks, 0);

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
  beforeDay: number
): number => {
  let accumulatedDays = 0;

  // Sortera perioder kronologiskt
  const sortedPeriods = [...parent.periods].sort(
    (a, b) => toDayNumber(a.start) - toDayNumber(b.start)
  );

  for (const period of sortedPeriods) {
    const periodStart = toDayNumber(period.start);
    const lastDay = toDayNumber(periodEnd(period));

    // Om perioden startar efter vårt datum, skippa
    if (periodStart >= beforeDay) {
      break;
    }

    // Om perioden är högNivå, räkna dagarna
    if (period.level === "high") {
      // Om perioden slutar före vårt datum, räkna alla dagar
      if (lastDay < beforeDay) {
        accumulatedDays += periodDays(period);
      } else {
        // Perioden pågår - räkna endast dagar fram till beforeDay
        const daysInPeriod = lastDay - periodStart + 1;
        const daysUntilBeforeDate = beforeDay - periodStart;
        const ratio = daysUntilBeforeDate / daysInPeriod;
        accumulatedDays += periodDays(period) * ratio;
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
  taxRate: number = DEFAULT_TAX_RATE
): MonthlyIncomeResult => {
  const monthStart = monthStartDay(year, month);
  const monthEnd = monthEndDay(year, month);

  let totalDaysThisMonth = 0;
  let workedDaysOnLeave = 0; // Arbetade dagar under lediga kalenderdagar (A2)
  let totalIncomeThisMonth = 0;
  let highLevelDaysThisMonth = 0; // För PAG-beräkning
  let lowLevelDaysThisMonth = 0; // För visuell indikering

  // Loop through all periods to see if any fall within this month
  for (const period of parent.periods) {
    const startDay = toDayNumber(period.start);
    const endDay = toDayNumber(periodEnd(period));

    // If period overlaps with this month
    if (!(monthStart > endDay || monthEnd < startDay)) {
      // Calculate days in this month for this period (both start and end day included)
      const overlapStart = Math.max(monthStart, startDay);
      const overlapEnd = Math.min(monthEnd, endDay);
      const overlapDays = overlapEnd - overlapStart + 1;

      totalDaysThisMonth += overlapDays;
      // A2: jobbar man de andra dagarna (5-dagarsvecka) får man lön för dem, t.ex. 2/5 vid
      // 3 dagar/vecka. Är man helt ledig och tar ut färre dagar är resten obetalda.
      if (period.worksOtherDays) {
        workedDaysOnLeave +=
          (overlapDays * Math.max(0, WORK_DAYS_PER_WEEK - period.daysPerWeek)) /
          WORK_DAYS_PER_WEEK;
      }

      // Calculate income based on period level (high/low)
      let dailyBenefitAfterTax: number;
      const effectiveDays = period.daysPerWeek * (overlapDays / 7);

      if (period.level === "low") {
        // Lägstanivå: 180 kr/dag efter skatt
        dailyBenefitAfterTax = BENEFIT.lowLevelDaily * (1 - taxRate);
        lowLevelDaysThisMonth += effectiveDays;
      } else {
        // Sjukpenningnivå: använd benefits.dailyBenefitAfterTax
        dailyBenefitAfterTax = benefits.dailyBenefitAfterTax;
        highLevelDaysThisMonth += effectiveDays;
      }

      // Beräkna inkomst för denna period
      const incomeForPeriod =
        dailyBenefitAfterTax * period.daysPerWeek * (overlapDays / 7);
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
    const sgiCeilingYearly = SGI.max;

    // Räkna ut hur många PAG-dagar som redan förbrukats före denna månad
    const accumulatedPAGDays = calculateAccumulatedPAGDays(parent, monthStart);

    // Hur många PAG-dagar kan vi använda denna månad?
    const maxPAGDays = parent.employerTopUpDays || DEFAULT_TOP_UP_DAYS;
    const remainingPAGDays = Math.max(0, maxPAGDays - accumulatedPAGDays);
    const pagDaysThisMonth = Math.min(highLevelDaysThisMonth, remainingPAGDays);

    if (pagDaysThisMonth > 0) {
      let dailyPAG = 0;

      if (yearlySalary <= sgiCeilingYearly) {
        const yearlyPAG = yearlySalary * (parent.employerTopUp / 100);
        dailyPAG = yearlyPAG / 365;
      } else {
        const underCeilingYearly = sgiCeilingYearly * TOP_UP.underCeilingRate;
        const overCeilingYearly =
          (yearlySalary - sgiCeilingYearly) * TOP_UP.overCeilingRate;
        const totalYearlyPAG = underCeilingYearly + overCeilingYearly;
        dailyPAG = totalYearlyPAG / 365;
      }

      const pagAfterTax = dailyPAG * pagDaysThisMonth * (1 - taxRate);
      totalIncomeThisMonth += pagAfterTax;
    }
  }

  // Lön för dagar utan ledighet och för arbetade dagar under deltidsledighet
  const daysInFullMonth = monthEnd - monthStart + 1;
  const workedDays = daysInFullMonth - totalDaysThisMonth + workedDaysOnLeave;
  const workRatio = Math.min(1, Math.max(0, workedDays / daysInFullMonth));
  const workIncome = parent.monthlySalary * (1 - taxRate) * workRatio;

  return {
    total: workIncome + totalIncomeThisMonth,
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
  const exceededDays = Math.max(0, totalDays - DAYS.total);

  if (exceededDays > 0) {
    warnings.push(
      `Totalt antal dagar (${totalDays}) överstiger maxgränsen på ${DAYS.total} dagar. ` +
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
 * VALIDERING: Högst 390 dagar på sjukpenningnivå och 90 på lägstanivå för barnet (A1).
 * Dagar över gränsen räknas ändå med i beloppen, men planen markeras som ogiltig.
 */
export const validateLevelDays = (
  parents: Parent[],
  numParents: 1 | 2
): DaysValidation => {
  const warnings: string[] = [];
  let highLevelDays = 0;
  let lowLevelDays = 0;

  for (const parent of parents.slice(0, numParents)) {
    for (const period of parent?.periods ?? []) {
      if (period.level === "high") {
        highLevelDays += periodDays(period);
      } else {
        lowLevelDays += periodDays(period);
      }
    }
  }

  const exceededHigh = Math.max(0, highLevelDays - DAYS.highLevelTotal);
  const exceededLow = Math.max(0, lowLevelDays - DAYS.lowLevelTotal);

  if (exceededHigh > 0) {
    warnings.push(
      `Ni planerar ${highLevelDays} dagar på sjukpenningnivå, men det finns ${DAYS.highLevelTotal}. ` +
        `Gör om ${exceededHigh} dagar till lägstanivå eller korta ledigheten.`
    );
  }

  if (exceededLow > 0) {
    warnings.push(
      `Ni planerar ${lowLevelDays} dagar på lägstanivå, men det finns ${DAYS.lowLevelTotal}. ` +
        `Korta ledigheten på lägstanivå med ${exceededLow} dagar.`
    );
  }

  return {
    isValid: warnings.length === 0,
    totalDays: highLevelDays + lowLevelDays,
    exceededDays: exceededHigh + exceededLow,
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
  if (parent1Days < DAYS.reservedPerParent) {
    warnings.push(
      `Förälder 1 har endast ${parent1Days} dagar. Varje förälder måste ta minst ${DAYS.reservedPerParent} reserverade dagar.`
    );
  }

  if (parent2Days < DAYS.reservedPerParent) {
    warnings.push(
      `Förälder 2 har endast ${parent2Days} dagar. Varje förälder måste ta minst ${DAYS.reservedPerParent} reserverade dagar.`
    );
  }

  // Kontrollera att inte mer än 150 dagar förs över
  const parent1Transferred = DAYS.perParent - parent1Days;
  const parent2Transferred = DAYS.perParent - parent2Days;

  if (parent1Transferred > DAYS.transferablePerParent) {
    warnings.push(
      `Förälder 1 försöker föra över ${parent1Transferred} dagar, men max ${DAYS.transferablePerParent} dagar kan föras över.`
    );
  }

  if (parent2Transferred > DAYS.transferablePerParent) {
    warnings.push(
      `Förälder 2 försöker föra över ${parent2Transferred} dagar, men max ${DAYS.transferablePerParent} dagar kan föras över.`
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
      if (period.level === "high") {
        totalHighLevelDays += periodDays(period);
      } else {
        hasLowLevelDays = true;
      }
    }
  }

  // Om det finns lågNivådagar men mindre än 180 högNivådagar totalt
  if (
    hasLowLevelDays &&
    totalHighLevelDays < DAYS.highLevelBeforeLowLevel
  ) {
    const daysRemaining =
      DAYS.highLevelBeforeLowLevel - totalHighLevelDays;
    warnings.push(
      `⚠️ De första ${DAYS.highLevelBeforeLowLevel} dagarna måste vara på sjukpenningnivå. ` +
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

  // Dubbeldagar räknas fram ur överlappet mellan föräldrarnas perioder
  const overlaps = getOverlaps(parents[0]?.periods ?? [], parents[1]?.periods ?? []);

  if (childBirthDate && isValidDate(childBirthDate)) {
    // Dagen barnet fyller 15 månader. Dubbeldagar måste tas ut före den dagen.
    const limit = addMonths(childBirthDate, DAYS.doubleDaysMaxAgeMonths);

    for (const overlap of overlaps) {
      // A5: varje dubbeldag ska vara före gränsen, inte bara den första.
      if (toDayNumber(overlap.start) >= toDayNumber(limit)) {
        warnings.push(
          `⚠️ Dubbeldagarna från ${overlap.start} tas ut efter att barnet fyllt ${DAYS.doubleDaysMaxAgeMonths} månader (${limit}). ` +
            `Dubbeldagar kan endast tas ut innan barnet fyller ${DAYS.doubleDaysMaxAgeMonths} månader.`
        );
      }
    }
  }

  const actualDoubleDays = overlaps.reduce((sum, overlap) => sum + overlap.days, 0);
  const exceededDays = Math.max(
    0,
    actualDoubleDays - DAYS.maxDoubleDays
  );

  if (exceededDays > 0) {
    warnings.push(
      `⚠️ Du har planerat ${actualDoubleDays} dubbeldagar, men max ${DAYS.maxDoubleDays} dubbeldagar tillåts. ` +
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
 * VARNING: SGI-skyddet. Efter barnets ettårsdag behöver den som är helt ledig ta ut
 * föräldrapenning minst 5 dagar i veckan, annars blir SGI 0 (B4).
 * Påverkar inte om planen är giltig.
 */
export const validateSgiProtection = (
  parents: Parent[],
  numParents: 1 | 2,
  childBirthDate?: string
): DaysValidation => {
  const warnings: string[] = [];

  if (childBirthDate && isValidDate(childBirthDate)) {
    const firstBirthday = toDayNumber(addYears(childBirthDate, 1));

    for (const parent of parents.slice(0, numParents)) {
      const atRisk = (parent?.periods ?? []).some(
        (period) =>
          period.daysPerWeek < WORK_DAYS_PER_WEEK &&
          !period.worksOtherDays &&
          toDayNumber(periodEnd(period)) >= firstBirthday
      );

      if (atRisk) {
        warnings.push(
          `${parent.name}: Efter barnets ettårsdag behöver du ta ut föräldrapenning minst ` +
            `${WORK_DAYS_PER_WEEK} hela dagar i veckan om du är helt ledig. ` +
            `Annars förlorar du din SGI, som styr din sjukpenning och föräldrapenning.`
        );
      }
    }
  }

  return { isValid: true, totalDays: 0, exceededDays: 0, warnings };
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
    levelDays: DaysValidation;
    reservedDays: DaysValidation;
    lowLevelDays: DaysValidation;
    doubleDays: DaysValidation;
    sgiProtection: DaysValidation;
  };
  allWarnings: string[];
} => {
  const totalDays = validateTotalDays(parents, numParents);
  const levelDays = validateLevelDays(parents, numParents);
  const reservedDays = validateReservedDays(parents, numParents);
  const lowLevelDays = validateLowLevelDaysRule(parents, numParents);
  const doubleDays = validateDoubleDays(parents, numParents, childBirthDate);
  const sgiProtection = validateSgiProtection(parents, numParents, childBirthDate);

  const allWarnings = [
    ...totalDays.warnings,
    ...levelDays.warnings,
    ...reservedDays.warnings,
    ...lowLevelDays.warnings,
    ...doubleDays.warnings,
    ...sgiProtection.warnings,
  ];

  const isValid =
    totalDays.isValid &&
    levelDays.isValid &&
    reservedDays.isValid &&
    lowLevelDays.isValid &&
    doubleDays.isValid;

  return {
    isValid,
    validations: {
      totalDays,
      levelDays,
      reservedDays,
      lowLevelDays,
      doubleDays,
      sgiProtection,
    },
    allWarnings,
  };
};
