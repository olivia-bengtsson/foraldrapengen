// Enhetstester för beräkningslogiken.
// Förväntade värden kommer från docs/GRANSKNING-2026.md (avsnitt 1, verifierade fakta för 2026).
// Kända fel är skrivna som test.skip med hänvisning till punkten i granskningen (A1, A2 ...).
// De beskriver det korrekta beteendet och ska slås på när felet är åtgärdat.
//
// Testperioderna ligger mitt i månader för att undvika tidszonsfelet i A15.

import { Parent, ParentalPeriod } from "../types";
import {
  calculateDailyBenefit,
  calculateParentBenefits,
  calculateSGI,
  calculateTax,
  getDaysBetweenDates,
  getMonthlyIncomeForParent,
  validateAllRules,
  validateDoubleDays,
  validateLowLevelDaysRule,
  validateReservedDays,
  validateTotalDays,
} from "./calculations";

const TAX_RATE = 0.3;

const makePeriod = (overrides: Partial<ParentalPeriod> = {}): ParentalPeriod => ({
  id: "p1",
  startDate: "2026-03-15",
  endDate: "2026-05-15",
  daysToTake: 50,
  daysPerWeek: 5,
  level: "high",
  ...overrides,
});

const makeParent = (overrides: Partial<Parent> = {}): Parent => ({
  id: 1,
  name: "Förälder 1",
  type: "employed",
  monthlySalary: 35000,
  employerTopUp: 0,
  employerTopUpDays: 180,
  periods: [],
  ...overrides,
});

const withDays = (days: number, overrides: Partial<ParentalPeriod> = {}) =>
  makeParent({ periods: [makePeriod({ daysToTake: days, ...overrides })] });

describe("calculateSGI", () => {
  test("hög lön takas vid 592 000 kr (10 prisbasbelopp)", () => {
    expect(calculateSGI(60000)).toBe(592000);
  });

  test("årsinkomst under 14 200 kr ger ingen SGI", () => {
    expect(calculateSGI(1000)).toBe(0);
  });

  // A7: SGI är årsinkomsten (högst 592 000), inte inkomsten × 0,97.
  test.skip("A7: lön 35 000 kr/mån ger SGI 420 000 kr", () => {
    expect(calculateSGI(35000)).toBe(420000);
  });
});

describe("calculateDailyBenefit", () => {
  test("högsta dagersättning är 1 259 kr vid SGI-taket", () => {
    expect(calculateDailyBenefit(592000)).toBe(1259);
  });

  test("ingen SGI ger grundnivån 250 kr/dag", () => {
    expect(calculateDailyBenefit(0)).toBe(250);
  });

  test("mycket låg SGI ger aldrig mindre än 250 kr/dag", () => {
    expect(calculateDailyBenefit(50000)).toBe(250);
  });

  test("lön 35 000 kr/mån ger ca 893 kr/dag", () => {
    expect(calculateDailyBenefit(calculateSGI(35000))).toBeCloseTo(893, 0);
  });

  // A7: dagersättning = round(SGI × 0,97 × 0,8 / 365), i hela kronor.
  test.skip("A7: SGI 420 000 kr ger exakt 893 kr/dag", () => {
    expect(calculateDailyBenefit(420000)).toBe(893);
  });
});

describe("calculateTax", () => {
  test("räknar skatt med angiven skattesats", () => {
    expect(calculateTax(1000, 0.32)).toBeCloseTo(320);
  });

  // A8: standardvärdet utan vald kommun ska vara snittet 32,38 %, inte 30 %.
  test.skip("A8: standardskatten är 32,38 %", () => {
    expect(calculateTax(1000)).toBeCloseTo(323.8);
  });
});

describe("getDaysBetweenDates", () => {
  // A11: både start- och slutdatum ska räknas med (+1).
  test.skip("A11: en vecka måndag–söndag är 7 dagar", () => {
    expect(getDaysBetweenDates("2026-03-02", "2026-03-08")).toBe(7);
  });
});

describe("calculateParentBenefits", () => {
  test("sjukpenningnivå ger dagersättning, lägstanivå ger 180 kr/dag", () => {
    const parent = makeParent({
      periods: [
        makePeriod({ id: "high", daysToTake: 100, level: "high" }),
        makePeriod({
          id: "low",
          startDate: "2026-06-15",
          endDate: "2026-07-15",
          daysToTake: 20,
          level: "low",
        }),
      ],
    });

    const result = calculateParentBenefits(parent, TAX_RATE);

    expect(result.highLevelDays).toBe(100);
    expect(result.lowLevelDays).toBe(20);
    expect(result.fkBenefitBeforeTax).toBeCloseTo(
      100 * result.dailyBenefit + 20 * 180
    );
  });

  test("föräldralön 10 % under taket betalas bara för avtalade dagar", () => {
    const parent = makeParent({
      employerTopUp: 10,
      employerTopUpDays: 180,
      periods: [makePeriod({ daysToTake: 240 })],
    });

    const result = calculateParentBenefits(parent, TAX_RATE);

    // 10 % av årslönen 420 000 kr, fördelat per dag, i 180 dagar
    const expectedBeforeTax = ((420000 * 0.1) / 365) * 180;
    expect(result.totalBenefitBeforeTax - result.fkBenefitBeforeTax).toBeCloseTo(
      expectedBeforeTax
    );
    expect(result.employerTopUpAmount).toBeCloseTo(
      expectedBeforeTax * (1 - TAX_RATE)
    );
  });

  test("föräldralön begränsas av antalet dagar på sjukpenningnivå", () => {
    const parent = makeParent({
      employerTopUp: 10,
      employerTopUpDays: 180,
      periods: [makePeriod({ daysToTake: 100 })],
    });

    const result = calculateParentBenefits(parent, TAX_RATE);

    expect(result.totalBenefitBeforeTax - result.fkBenefitBeforeTax).toBeCloseTo(
      ((420000 * 0.1) / 365) * 100
    );
  });

  // A9: de flesta avtal ger föräldralön i upp till 6 månader, standard ska vara 180 dagar.
  test.skip("A9: utan angivet antal dagar betalas föräldralön i 180 dagar", () => {
    const parent = makeParent({
      employerTopUp: 10,
      employerTopUpDays: 0,
      periods: [makePeriod({ daysToTake: 240 })],
    });

    const result = calculateParentBenefits(parent, TAX_RATE);

    expect(result.totalBenefitBeforeTax - result.fkBenefitBeforeTax).toBeCloseTo(
      ((420000 * 0.1) / 365) * 180
    );
  });

  // A9: över taket ignoreras användarens procentsats och 10 % är hårdkodat.
  test.skip("A9: vald procentsats används även när lönen är över taket", () => {
    const parent = makeParent({
      monthlySalary: 70000,
      employerTopUp: 5,
      employerTopUpDays: 180,
      periods: [makePeriod({ daysToTake: 180 })],
    });

    const result = calculateParentBenefits(parent, TAX_RATE);

    const yearlyCeiling = 592000;
    const yearlyTopUp = yearlyCeiling * 0.05 + (70000 * 12 - yearlyCeiling) * 0.9;
    expect(result.totalBenefitBeforeTax - result.fkBenefitBeforeTax).toBeCloseTo(
      (yearlyTopUp / 365) * 180
    );
  });
});

describe("getMonthlyIncomeForParent", () => {
  test("månad utan ledighet ger lön efter skatt", () => {
    const parent = withDays(50);
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    // Juli 2026, perioden ligger i mars–maj
    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 6, TAX_RATE);

    expect(result.days).toBe(0);
    expect(result.total).toBeCloseTo(35000 * (1 - TAX_RATE));
  });

  test("hel månad på lägstanivå 7 dagar/vecka ger 180 kr/dag efter skatt", () => {
    const parent = withDays(61, {
      startDate: "2026-04-15",
      endDate: "2026-06-15",
      daysPerWeek: 7,
      level: "low",
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    // Maj 2026, 31 dagar
    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 4, TAX_RATE);

    expect(result.total).toBeCloseTo(180 * (1 - TAX_RATE) * 31);
  });

  // A15: slutdatumet tolkades som UTC och räknades som 2 dagar i månaden.
  test("period som slutar den 1:a ger 1 dag i den månaden", () => {
    const parent = withDays(10, {
      startDate: "2026-02-16",
      endDate: "2026-03-01",
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 2, TAX_RATE);

    expect(result.days).toBe(1);
  });

  // A2: ledighet 3 dagar/vecka hela månaden ska ge lön för de 2 arbetade dagarna.
  test.skip("A2: deltidsledighet ger lön för arbetade dagar", () => {
    const parent = withDays(40, {
      startDate: "2026-04-15",
      endDate: "2026-06-15",
      daysPerWeek: 3,
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 4, TAX_RATE);

    const salaryPart = 35000 * (1 - TAX_RATE) * (2 / 5);
    const leavePart = benefits.dailyBenefitAfterTax * 3 * (31 / 7);
    expect(result.total).toBeCloseTo(salaryPart + leavePart);
  });

  // A3: antal dagar och datum är två sanningskällor. Månadstabellen ska ge samma
  // ersättning som totalen, även när slutdatumet inte stämmer med antalet dagar.
  test.skip("A3: summan av månaderna stämmer med totalen", () => {
    const parent = withDays(100, {
      startDate: "2026-03-01",
      endDate: "2026-12-31",
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    let sum = 0;
    for (let month = 2; month <= 11; month++) {
      sum += getMonthlyIncomeForParent(parent, benefits, 2026, month, TAX_RATE)
        .total;
    }

    expect(sum).toBeCloseTo(benefits.fkBenefitAfterTax, 0);
  });
});

describe("validateTotalDays", () => {
  test("480 dagar totalt godkänns", () => {
    const result = validateTotalDays([withDays(240), withDays(240)], 2);

    expect(result.isValid).toBe(true);
    expect(result.totalDays).toBe(480);
  });

  test("481 dagar totalt underkänns", () => {
    const result = validateTotalDays([withDays(240), withDays(241)], 2);

    expect(result.isValid).toBe(false);
    expect(result.exceededDays).toBe(1);
  });
});

describe("validateReservedDays", () => {
  // A6: reserverade dagar är inget krav, de går förlorade om de inte tas ut.
  test.skip("A6: varningen säger att reserverade dagar går förlorade", () => {
    const result = validateReservedDays([withDays(240), withDays(60)], 2);

    expect(result.warnings.join(" ")).toMatch(/går förlorade/);
    expect(result.warnings.join(" ")).not.toMatch(/måste/);
  });
});

describe("validateLowLevelDaysRule", () => {
  const withHighAndLow = (highDays: number) =>
    makeParent({
      periods: [
        makePeriod({ id: "high", daysToTake: highDays, level: "high" }),
        makePeriod({
          id: "low",
          startDate: "2026-10-15",
          endDate: "2026-11-15",
          daysToTake: 10,
          level: "low",
        }),
      ],
    });

  test("lägstanivå efter 180 dagar på sjukpenningnivå godkänns", () => {
    expect(validateLowLevelDaysRule([withHighAndLow(180)], 1).isValid).toBe(true);
  });

  test("lägstanivå efter 179 dagar på sjukpenningnivå underkänns", () => {
    expect(validateLowLevelDaysRule([withHighAndLow(179)], 1).isValid).toBe(false);
  });
});

describe("validateDoubleDays", () => {
  const doubleDayParents = (days: number, startDate = "2026-03-15") => [
    withDays(days, { isDoubleDay: true, startDate }),
    withDays(days, { isDoubleDay: true, startDate }),
  ];

  test("60 dubbeldagar godkänns", () => {
    const result = validateDoubleDays(doubleDayParents(60), 2);

    expect(result.isValid).toBe(true);
    expect(result.totalDays).toBe(60);
  });

  test("61 dubbeldagar underkänns", () => {
    const result = validateDoubleDays(doubleDayParents(61), 2);

    expect(result.isValid).toBe(false);
    expect(result.exceededDays).toBe(1);
  });

  test("ensamförälder godkänns alltid", () => {
    expect(validateDoubleDays(doubleDayParents(100), 1).isValid).toBe(true);
  });

  test("dubbeldagar efter 15 månaders ålder underkänns", () => {
    const result = validateDoubleDays(
      doubleDayParents(20, "2027-06-15"),
      2,
      "2026-01-15"
    );

    expect(result.isValid).toBe(false);
  });

  // A5: varje överlappande dag ska vara före 15-månadersdagen, inte bara periodens start.
  test.skip("A5: period som slutar efter 15 månaders ålder underkänns", () => {
    const period = { isDoubleDay: true, startDate: "2027-03-15", endDate: "2027-05-15" };
    const result = validateDoubleDays(
      [withDays(20, period), withDays(20, period)],
      2,
      "2026-01-15"
    );

    expect(result.isValid).toBe(false);
  });

  // A5: reserverade dagar får inte användas som dubbeldagar.
  test.skip("A5: dubbeldagar från de reserverade dagarna underkänns", () => {
    const parent2 = makeParent({
      id: 2,
      periods: [
        makePeriod({ id: "own", daysToTake: 80 }),
        makePeriod({
          id: "double",
          startDate: "2026-08-15",
          endDate: "2026-09-15",
          daysToTake: 30,
          isDoubleDay: true,
        }),
      ],
    });
    const parent1 = withDays(30, {
      startDate: "2026-08-15",
      endDate: "2026-09-15",
      isDoubleDay: true,
    });

    // Förälder 2 har 110 dagar, varav 30 dubbeldagar, men bara 110 − 90 = 20 får vara dubbeldagar
    expect(validateDoubleDays([parent1, parent2], 2).isValid).toBe(false);
  });
});

describe("validateAllRules", () => {
  test("rimlig plan för två föräldrar godkänns", () => {
    const result = validateAllRules([withDays(195), withDays(195)], 2);

    expect(result.isValid).toBe(true);
    expect(result.allWarnings).toEqual([]);
  });

  // A1: högst 390 dagar på sjukpenningnivå, resten är lägstanivå.
  test.skip("A1: fler än 390 dagar på sjukpenningnivå underkänns", () => {
    const result = validateAllRules([withDays(240), withDays(240)], 2);

    expect(result.isValid).toBe(false);
  });
});
