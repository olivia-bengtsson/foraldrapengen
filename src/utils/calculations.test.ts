// Enhetstester för beräkningslogiken.
// Förväntade värden kommer från docs/GRANSKNING-2026.md (avsnitt 1, verifierade fakta för 2026).
// Kända fel är skrivna som test.skip med hänvisning till punkten i granskningen (A1, A2 ...).
// De beskriver det korrekta beteendet och ska slås på när felet är åtgärdat.
//

import { Parent, ParentalPeriod } from "../types";
import {
  calculateDailyBenefit,
  calculateParentBenefits,
  calculateSGI,
  calculateTax,
  employerTopUpForRange,
  getDaysBetweenDates,
  getMonthlyIncomeForParent,
  validateAllRules,
  validateDoubleDays,
  validateLevelDays,
  validateLowLevelDaysRule,
  validateReservedDays,
  validateSgiProtection,
  validateTotalDays,
  yearlyEmployerTopUp,
} from "./calculations";
import { monthEndDay, monthStartDay } from "./dates";

const TAX_RATE = 0.3;

// Föräldralön med vanliga villkor, och föräldralön per kalenderdag vid lön 35 000 kr/mån
const TOP_UP_10_90 = {
  topUpUnderCeilingPercent: 10,
  topUpOverCeilingPercent: 90,
  topUpDays: 180,
};
const PER_DAY_35000 = (35000 * 12 * 0.1) / 365;

const makePeriod = (overrides: Partial<ParentalPeriod> = {}): ParentalPeriod => ({
  id: "p1",
  start: "2026-03-16",
  weeks: 10,
  daysPerWeek: 5,
  level: "high",
  worksOtherDays: false,
  ...overrides,
});

const makeParent = (overrides: Partial<Parent> = {}): Parent => ({
  id: 1,
  name: "Förälder 1",
  type: "employed",
  monthlySalary: 35000,
  topUpUnderCeilingPercent: 0,
  topUpOverCeilingPercent: 0,
  topUpDays: 180,
  periods: [],
  ...overrides,
});

const withPeriods = (...periods: Partial<ParentalPeriod>[]) =>
  makeParent({
    periods: periods.map((p, i) => makePeriod({ id: `p${i + 1}`, ...p })),
  });

// Förälder med dagar × 5 dagar/vecka, utan hänsyn till datum
const withDays = (days: number, start = "2026-03-16") =>
  withPeriods({ start, weeks: days / 5 });

describe("calculateSGI", () => {
  test("hög lön takas vid 592 000 kr (10 prisbasbelopp)", () => {
    expect(calculateSGI(60000)).toBe(592000);
  });

  test("årsinkomst under 14 200 kr ger ingen SGI", () => {
    expect(calculateSGI(1000)).toBe(0);
  });

  // A7: SGI är årsinkomsten (högst 592 000), inte inkomsten × 0,97.
  test("A7: lön 35 000 kr/mån ger SGI 420 000 kr", () => {
    expect(calculateSGI(35000)).toBe(420000);
  });

  test("lön 49 333 kr/mån ger SGI 591 996 kr (under taket)", () => {
    expect(calculateSGI(49333)).toBe(591996);
  });

  test("årsinkomst strax över och under 14 200 kr", () => {
    expect(calculateSGI(1200)).toBe(14400); // 14 400 kr/år
    expect(calculateSGI(1180)).toBe(0); // 14 160 kr/år
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

  test("lön 35 000 kr/mån ger 893 kr/dag", () => {
    expect(calculateDailyBenefit(calculateSGI(35000))).toBe(893);
  });

  // A7: dagersättning = round(SGI × 0,97 × 0,8 / 365), i hela kronor.
  test("A7: SGI 420 000 kr ger exakt 893 kr/dag", () => {
    // 420 000 × 0,97 × 0,8 / 365 = 892,93
    expect(calculateDailyBenefit(420000)).toBe(893);
  });

  test.each([
    // [SGI, SGI × 0,97 × 0,8 / 365, förväntat]
    [591996, "1 258,60", 1259],
    [360000, "765,37", 765],
    [240000, "510,25", 510],
    [14400, "30,61", 250], // under grundnivån
  ])("SGI %i ger %s → %i kr/dag", (sgi, _exact, expected) => {
    expect(calculateDailyBenefit(sgi as number)).toBe(expected);
  });

  test("dagersättningen är alltid hela kronor", () => {
    for (let salary = 0; salary <= 70000; salary += 1234) {
      expect(Number.isInteger(calculateDailyBenefit(calculateSGI(salary)))).toBe(true);
    }
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
    const parent = withPeriods(
      { weeks: 20, level: "high" },
      { start: "2026-08-03", weeks: 4, level: "low" }
    );

    const result = calculateParentBenefits(parent, TAX_RATE);

    expect(result.highLevelDays).toBe(100);
    expect(result.lowLevelDays).toBe(20);
    expect(result.fkBenefitBeforeTax).toBeCloseTo(
      100 * result.dailyBenefit + 20 * 180
    );
  });

  test("föräldralön ingår i totalen efter skatt", () => {
    const parent = makeParent({
      ...TOP_UP_10_90,
      periods: [makePeriod({ weeks: 48 })], // 240 dagar
    });

    const result = calculateParentBenefits(parent, TAX_RATE);

    // 180 kalenderdagar × 10 % av 420 000 kr / 365
    const expectedBeforeTax = PER_DAY_35000 * 180;
    expect(result.totalBenefitBeforeTax - result.fkBenefitBeforeTax).toBeCloseTo(
      expectedBeforeTax
    );
    expect(result.employerTopUpAmount).toBeCloseTo(expectedBeforeTax * (1 - TAX_RATE));
  });
});

// A9: föräldralön i kalendertid, sammanlagda kalenderdagar i perioder på sjukpenningnivå
describe("employerTopUpForRange", () => {
  const topUpParent = (...periods: Partial<ParentalPeriod>[]) =>
    makeParent({
      ...TOP_UP_10_90,
      periods: periods.map((p, i) => makePeriod({ id: `p${i + 1}`, ...p })),
    });

  test("5 dagar/vecka: 180 kalenderdagar", () => {
    expect(employerTopUpForRange(topUpParent({ weeks: 48 }))).toBeCloseTo(
      PER_DAY_35000 * 180
    );
  });

  test("3 dagar/vecka: 180 kalenderdagar × 3/5", () => {
    expect(employerTopUpForRange(topUpParent({ weeks: 48, daysPerWeek: 3 }))).toBeCloseTo(
      PER_DAY_35000 * 180 * (3 / 5)
    );
  });

  test("7 dagar/vecka ger samma nivå som 5 dagar/vecka", () => {
    expect(employerTopUpForRange(topUpParent({ weeks: 48, daysPerWeek: 7 }))).toBeCloseTo(
      PER_DAY_35000 * 180
    );
  });

  test("kortare ledighet än 180 dagar ger föräldralön för hela perioden", () => {
    // 20 veckor = 140 kalenderdagar
    expect(employerTopUpForRange(topUpParent({ weeks: 20 }))).toBeCloseTo(
      PER_DAY_35000 * 140
    );
  });

  test("uppdelade perioder räknas sammanlagt, lägstanivå räknas inte", () => {
    const parent = topUpParent(
      { start: "2026-03-16", weeks: 10 }, // 70 kalenderdagar
      { start: "2026-05-25", weeks: 4, level: "low" },
      { start: "2026-09-07", weeks: 20 } // 140 kalenderdagar, varav 110 med föräldralön
    );

    expect(employerTopUpForRange(parent)).toBeCloseTo(PER_DAY_35000 * 180);
  });

  test("bara lägstanivå ger ingen föräldralön", () => {
    expect(employerTopUpForRange(topUpParent({ weeks: 20, level: "low" }))).toBe(0);
  });

  test("egenföretagare får ingen föräldralön", () => {
    const parent = { ...topUpParent({ weeks: 48 }), type: "self_employed" as const };
    expect(employerTopUpForRange(parent)).toBe(0);
  });

  test("0 % under och över taket ger ingen föräldralön", () => {
    const parent = {
      ...topUpParent({ weeks: 48 }),
      topUpUnderCeilingPercent: 0,
      topUpOverCeilingPercent: 0,
    };
    expect(employerTopUpForRange(parent)).toBe(0);
  });

  // A9: över taket användes 10 % hårdkodat i stället för vald procentsats.
  test("A9: vald procentsats används även när lönen är över taket", () => {
    const parent = {
      ...topUpParent({ weeks: 36 }),
      monthlySalary: 70000,
      topUpUnderCeilingPercent: 5,
    };

    const yearlyTopUp = 592000 * 0.05 + (70000 * 12 - 592000) * 0.9;
    expect(yearlyEmployerTopUp(parent)).toBeCloseTo(yearlyTopUp);
    expect(employerTopUpForRange(parent)).toBeCloseTo((yearlyTopUp / 365) * 180);
  });

  test("summan av månaderna är lika med totalen", () => {
    const parent = topUpParent({ start: "2026-03-16", weeks: 48, daysPerWeek: 3 });

    let sum = 0;
    for (let month = 2; month < 2 + 14; month++) {
      const year = 2026 + Math.floor(month / 12);
      sum += employerTopUpForRange(
        parent,
        monthStartDay(year, month % 12),
        monthEndDay(year, month % 12)
      );
    }

    expect(sum).toBeCloseTo(employerTopUpForRange(parent));
  });

  test("månadsinkomsten innehåller föräldralön bara de första 180 dagarna", () => {
    // Start 1 april: dag 180 är 27 september
    const parent = topUpParent({ start: "2026-04-01", weeks: 48 });
    const benefits = calculateParentBenefits(parent, TAX_RATE);
    const leavePerMonth = (days: number) => benefits.dailyBenefitAfterTax * 5 * (days / 7);

    const april = getMonthlyIncomeForParent(parent, benefits, 2026, 3, TAX_RATE);
    expect(april.total).toBeCloseTo(
      leavePerMonth(30) + PER_DAY_35000 * 30 * (1 - TAX_RATE)
    );

    const october = getMonthlyIncomeForParent(parent, benefits, 2026, 9, TAX_RATE);
    expect(october.total).toBeCloseTo(leavePerMonth(31));
  });
});

describe("getMonthlyIncomeForParent", () => {
  test("månad utan ledighet ger lön efter skatt", () => {
    const parent = withPeriods({ start: "2026-03-16", weeks: 8 });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    // Juli 2026, perioden ligger i mars–maj
    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 6, TAX_RATE);

    expect(result.days).toBe(0);
    expect(result.total).toBeCloseTo(35000 * (1 - TAX_RATE));
  });

  test("hel månad på lägstanivå 7 dagar/vecka ger 180 kr/dag efter skatt", () => {
    const parent = withPeriods({
      start: "2026-04-15",
      weeks: 9,
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
    // 2 veckor från 16 feb slutar 1 mar
    const parent = withPeriods({ start: "2026-02-16", weeks: 2 });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 2, TAX_RATE);

    expect(result.days).toBe(1);
  });

  // A2: ledighet 3 dagar/vecka hela månaden ska ge lön för de 2 arbetade dagarna.
  test("A2: deltidsledig som jobbar de andra dagarna får lön för dem", () => {
    const parent = withPeriods({
      start: "2026-04-15",
      weeks: 9,
      daysPerWeek: 3,
      worksOtherDays: true,
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 4, TAX_RATE);

    const salaryPart = 35000 * (1 - TAX_RATE) * (2 / 5);
    const leavePart = benefits.dailyBenefitAfterTax * 3 * (31 / 7);
    expect(result.total).toBeCloseTo(salaryPart + leavePart);
  });

  // A2: helt ledig men tar bara ut 3 dagar/vecka, de andra dagarna är obetalda.
  test("A2: helt ledig med 3 dagar/vecka får ingen lön", () => {
    const parent = withPeriods({
      start: "2026-04-15",
      weeks: 9,
      daysPerWeek: 3,
      worksOtherDays: false,
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 4, TAX_RATE);

    expect(result.total).toBeCloseTo(benefits.dailyBenefitAfterTax * 3 * (31 / 7));
  });

  // A2
  test("ledig 2 dagar/vecka och jobbar resten ger 3/5 av lönen", () => {
    const parent = withPeriods({
      start: "2026-04-15",
      weeks: 9,
      daysPerWeek: 2,
      worksOtherDays: true,
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 4, TAX_RATE);

    const salaryPart = 35000 * (1 - TAX_RATE) * (3 / 5);
    const leavePart = benefits.dailyBenefitAfterTax * 2 * (31 / 7);
    expect(result.total).toBeCloseTo(salaryPart + leavePart);
  });

  // A2
  test("ledig 7 dagar/vecka hela månaden ger ingen lön, även om man svarat att man jobbar", () => {
    const parent = withPeriods({
      start: "2026-04-15",
      weeks: 9,
      daysPerWeek: 7,
      worksOtherDays: true,
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 4, TAX_RATE);

    expect(result.total).toBeCloseTo(benefits.dailyBenefitAfterTax * 31);
  });

  // A2
  test("ledig 3 dagar/vecka halva månaden ger full lön resten av månaden", () => {
    // 2 veckor 1–14 juni (30 dagar i juni)
    const parent = withPeriods({
      start: "2026-06-01",
      weeks: 2,
      daysPerWeek: 3,
      worksOtherDays: true,
    });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 5, TAX_RATE);

    const workedDays = 16 + 14 * (2 / 5);
    const salaryPart = 35000 * (1 - TAX_RATE) * (workedDays / 30);
    const leavePart = benefits.dailyBenefitAfterTax * 3 * 2;
    expect(result.total).toBeCloseTo(salaryPart + leavePart);
  });

  test("ledig 5 dagar/vecka halva månaden ger halv lön", () => {
    const parent = withPeriods({ start: "2026-06-01", weeks: 2, daysPerWeek: 5 });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    const result = getMonthlyIncomeForParent(parent, benefits, 2026, 5, TAX_RATE);

    const salaryPart = 35000 * (1 - TAX_RATE) * (16 / 30);
    const leavePart = benefits.dailyBenefitAfterTax * 10;
    expect(result.total).toBeCloseTo(salaryPart + leavePart);
  });

  // A3: antal dagar räknas fram ur veckor, så månadstabellen och totalen kan inte hamna i otakt.
  test("A3: summan av dagarna per månad stämmer med totalen", () => {
    const parent = withPeriods({ start: "2026-03-02", weeks: 20 });
    const benefits = calculateParentBenefits(parent, TAX_RATE);

    let highDays = 0;
    for (let month = 2; month <= 6; month++) {
      highDays += getMonthlyIncomeForParent(parent, benefits, 2026, month, TAX_RATE)
        .highDays;
    }

    expect(highDays).toBeCloseTo(benefits.highLevelDays);
  });
});

describe("validateTotalDays", () => {
  test("480 dagar totalt godkänns", () => {
    const result = validateTotalDays([withDays(240), withDays(240)], 2);

    expect(result.isValid).toBe(true);
    expect(result.totalDays).toBe(480);
  });

  test("481 dagar totalt underkänns", () => {
    const parent2 = withPeriods(
      { weeks: 48 }, // 240 dagar
      { start: "2027-03-01", weeks: 1, daysPerWeek: 1 }
    );
    const result = validateTotalDays([withDays(240), parent2], 2);

    expect(result.isValid).toBe(false);
    expect(result.exceededDays).toBe(1);
  });
});

describe("validateLevelDays", () => {
  // Två föräldrar efter varandra: högNivå-dagar för förälder 1 och 2, sedan lägstanivå
  const plan = (high1: number, high2: number, low: number) => [
    withPeriods({ start: "2026-03-16", weeks: high1 / 5 }),
    withPeriods(
      { start: "2027-03-15", weeks: high2 / 5 },
      { start: "2028-03-13", weeks: low / 5, level: "low" }
    ),
  ];

  test("390 dagar på sjukpenningnivå och 90 på lägstanivå godkänns", () => {
    const result = validateLevelDays(plan(195, 195, 90), 2);

    expect(result.isValid).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  test("fler än 390 dagar på sjukpenningnivå underkänns", () => {
    const result = validateLevelDays(plan(200, 195, 85), 2);

    expect(result.isValid).toBe(false);
    expect(result.exceededDays).toBe(5);
    expect(result.warnings.join(" ")).toMatch(/395 dagar på sjukpenningnivå/);
  });

  test("391 dagar på sjukpenningnivå underkänns", () => {
    const parents = plan(195, 195, 90);
    parents[1].periods.push(
      makePeriod({ id: "extra", start: "2029-03-12", weeks: 1, daysPerWeek: 1 })
    );

    expect(validateLevelDays(parents, 2).exceededDays).toBe(1);
  });

  test("fler än 90 dagar på lägstanivå underkänns", () => {
    const result = validateLevelDays(plan(195, 190, 95), 2);

    expect(result.isValid).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/95 dagar på lägstanivå/);
  });

  test("samma gränser gäller för en ensamförälder", () => {
    const single = withPeriods(
      { start: "2026-03-16", weeks: 78 }, // 390 dagar
      { start: "2027-09-13", weeks: 19, level: "low" } // 95 dagar
    );

    const result = validateLevelDays([single], 1);

    expect(result.isValid).toBe(false);
    expect(result.exceededDays).toBe(5);
  });

  test("förälder 2 räknas inte med för en ensamförälder", () => {
    const [parent1, parent2] = plan(195, 300, 0);

    expect(validateLevelDays([parent1, parent2], 1).isValid).toBe(true);
  });
});

describe("validateReservedDays", () => {
  // A6: reserverade dagar är inget krav, de går förlorade om de inte tas ut.
  test("A6: varningen säger att reserverade dagar går förlorade", () => {
    const result = validateReservedDays([withDays(240), withDays(60, "2027-02-15")], 2);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/30 reserverade dagar går förlorade/);
    expect(result.warnings.join(" ")).not.toMatch(/måste|föra över 180/);
    // Förlorade dagar är inget regelbrott
    expect(result.isValid).toBe(true);
  });

  test("90 egna dagar på sjukpenningnivå ger ingen varning", () => {
    const result = validateReservedDays([withDays(240), withDays(90, "2027-02-15")], 2);

    expect(result.warnings).toEqual([]);
  });

  test("dagar på lägstanivå räknas inte som reserverade dagar", () => {
    const parent2 = withPeriods(
      { start: "2027-02-15", weeks: 9 }, // 45 dagar sjukpenningnivå
      { start: "2027-04-19", weeks: 9, level: "low" } // 45 dagar lägstanivå
    );
    const result = validateReservedDays([withDays(240), parent2], 2);

    expect(result.warnings.join(" ")).toMatch(/45 reserverade dagar går förlorade/);
  });

  test("390 dagar för en förälder godkänns", () => {
    const result = validateReservedDays([withDays(390), withDays(90, "2027-09-13")], 2);

    expect(result.isValid).toBe(true);
  });

  test("391 dagar för en förälder underkänns (högst 240 + 150 överförda)", () => {
    const parent1 = withPeriods(
      { weeks: 78 }, // 390 dagar
      { start: "2027-09-13", weeks: 1, daysPerWeek: 1 }
    );
    const result = validateReservedDays([parent1, withDays(89, "2028-01-03")], 2);

    expect(result.isValid).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/391 dagar, men kan få högst 390/);
  });

  test("ensamförälder har inga reserverade dagar att förlora", () => {
    expect(validateReservedDays([withDays(240)], 1).warnings).toEqual([]);
  });
});

describe("validateLowLevelDaysRule", () => {
  // A16: kontrolleras i tidsordning, inte bara som totalsumma
  test("A16: lägstanivå före sjukpenningnivå underkänns även om totalen räcker", () => {
    const parent = withPeriods(
      { start: "2026-03-16", weeks: 2, level: "low" },
      { start: "2026-03-30", weeks: 40 } // 200 dagar
    );

    expect(validateLowLevelDaysRule([parent], 1).isValid).toBe(false);
  });

  test("A16: lägstanivå under förälder 1:s period räknas med andelen före", () => {
    const parent1 = withPeriods({ start: "2026-03-16", weeks: 40 }); // 200 dagar
    // Vecka 30: 200 × 210/280 = 150 dagar före. Vecka 36: 180 dagar före.
    const early = withPeriods({ start: "2026-10-12", weeks: 2, level: "low" });
    const onTime = withPeriods({ start: "2026-11-23", weeks: 2, level: "low" });

    expect(validateLowLevelDaysRule([parent1, early], 2).isValid).toBe(false);
    expect(validateLowLevelDaysRule([parent1, onTime], 2).isValid).toBe(true);
  });

  test("A5: lägstanivå som dubbeldag före 180 sjukpenningdagar underkänns", () => {
    const low: Partial<ParentalPeriod> = { start: "2026-03-16", weeks: 2, level: "low" };

    expect(validateLowLevelDaysRule([withPeriods(low), withPeriods(low)], 2).isValid).toBe(
      false
    );
  });

  test("A5: lägstanivå som dubbeldag efter 180 sjukpenningdagar godkänns", () => {
    const low: Partial<ParentalPeriod> = { start: "2026-11-23", weeks: 2, level: "low" };
    const parent1 = withPeriods({ start: "2026-03-16", weeks: 36 }, low); // 180 dagar först

    expect(validateLowLevelDaysRule([parent1, withPeriods(low)], 2).isValid).toBe(true);
  });

  const lowPeriod: Partial<ParentalPeriod> = {
    start: "2027-03-01",
    weeks: 2,
    level: "low",
  };

  test("lägstanivå efter 180 dagar på sjukpenningnivå godkänns", () => {
    const parent = withPeriods({ weeks: 36 }, lowPeriod); // 180 dagar
    expect(validateLowLevelDaysRule([parent], 1).isValid).toBe(true);
  });

  test("lägstanivå efter 179 dagar på sjukpenningnivå underkänns", () => {
    const parent = withPeriods(
      { weeks: 35 }, // 175 dagar
      { start: "2026-11-16", weeks: 1, daysPerWeek: 4 },
      lowPeriod
    );
    expect(validateLowLevelDaysRule([parent], 1).isValid).toBe(false);
  });
});

describe("validateDoubleDays", () => {
  // Dubbeldagar räknas fram ur överlappet mellan föräldrarnas perioder
  const together = (period: Partial<ParentalPeriod>) => [
    withPeriods(period),
    withPeriods(period),
  ];

  test("60 dubbeldagar godkänns", () => {
    // 12 veckor tillsammans × 5 dagar
    const result = validateDoubleDays(together({ weeks: 12 }), 2);

    expect(result.isValid).toBe(true);
    expect(result.totalDays).toBe(60);
  });

  test("61 dubbeldagar underkänns", () => {
    // 61 kalenderdagar tillsammans, 7 dagar/vecka
    const result = validateDoubleDays(
      [
        withPeriods({ start: "2026-03-16", weeks: 9, daysPerWeek: 7 }),
        withPeriods({ start: "2026-03-18", weeks: 9, daysPerWeek: 7 }),
      ],
      2
    );

    expect(result.isValid).toBe(false);
    expect(result.exceededDays).toBe(1);
  });

  test("perioder efter varandra ger inga dubbeldagar", () => {
    const result = validateDoubleDays(
      [withDays(240), withDays(240, "2027-02-15")],
      2
    );

    expect(result.totalDays).toBe(0);
  });

  test("ensamförälder godkänns alltid", () => {
    expect(validateDoubleDays(together({ weeks: 20 }), 1).isValid).toBe(true);
  });

  test("dubbeldagar efter 15 månaders ålder underkänns", () => {
    const result = validateDoubleDays(
      together({ start: "2027-06-14", weeks: 4 }),
      2,
      "2026-01-15"
    );

    expect(result.isValid).toBe(false);
  });

  // 15 månader från 31 januari är 30 april (månadens sista dag)
  test("dubbeldagar som slutar dagen före 15-månadersdagen godkänns", () => {
    // 23–29 april
    const result = validateDoubleDays(
      together({ start: "2027-04-23", weeks: 1, daysPerWeek: 1 }),
      2,
      "2026-01-31"
    );

    expect(result.isValid).toBe(true);
  });

  test("dubbeldagar på 15-månadersdagen underkänns", () => {
    const result = validateDoubleDays(
      together({ start: "2027-04-30", weeks: 1, daysPerWeek: 1 }),
      2,
      "2026-01-31"
    );

    expect(result.isValid).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/2027-04-30/);
  });

  // A5: varje dubbeldag ska vara före 15-månadersdagen, inte bara överlappets start.
  test("A5: överlapp som slutar efter 15 månaders ålder underkänns", () => {
    // Gräns 2027-04-15. Överlapp 2027-03-15 – 2027-05-16: 32 dagar efter gränsen × 5/7 = 23
    const result = validateDoubleDays(
      together({ start: "2027-03-15", weeks: 9 }),
      2,
      "2026-01-15"
    );

    expect(result.isValid).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/23 dubbeldagar ligger på eller efter/);
  });

  // A5: dubbeldagar kan inte tas från de reserverade dagarna.
  test("A5: dubbeldagar som inte ryms utöver de reserverade dagarna underkänns", () => {
    const shared: Partial<ParentalPeriod> = { start: "2026-03-16", weeks: 6 }; // 30 dubbeldagar
    // Förälder 1: 30 + 340 = 370 dagar, alltså 130 överförda från förälder 2
    const parent1 = withPeriods(shared, { start: "2026-04-27", weeks: 68 });
    // Förälder 2: 30 + 80 = 110 dagar, bara 150 − 130 = 20 dagar utöver de reserverade
    const parent2 = withPeriods(shared, { start: "2027-09-06", weeks: 16 });

    const result = validateDoubleDays([parent1, parent2], 2);

    expect(result.isValid).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/30 dubbeldagar, men bara 20 dagar utöver/);
  });

  test("A5: utan överföring ryms dubbeldagarna, men reserverade dagar går förlorade", () => {
    const shared: Partial<ParentalPeriod> = { start: "2026-08-03", weeks: 6 };
    const parent1 = withPeriods(shared, { start: "2026-09-14", weeks: 42 }); // 240 dagar
    const parent2 = withPeriods({ start: "2026-03-16", weeks: 16 }, shared); // 110 dagar

    expect(validateDoubleDays([parent1, parent2], 2).isValid).toBe(true);

    // 110 − 30 dubbeldagar = 80 egna dagar, 10 reserverade går förlorade
    const reserved = validateReservedDays([parent1, parent2], 2);
    expect(reserved.isValid).toBe(true);
    expect(reserved.warnings.join(" ")).toMatch(/10 reserverade dagar går förlorade/);
  });
});

describe("validateSgiProtection", () => {
  // Barnet fyller 1 år 2027-01-15
  const BIRTH = "2026-01-15";
  const warningsFor = (period: Partial<ParentalPeriod>, birth = BIRTH) =>
    validateSgiProtection([withPeriods(period)], 1, birth).warnings;

  test("helt ledig med färre än 5 dagar/vecka efter ettårsdagen ger varning", () => {
    const warnings = warningsFor({ start: "2027-02-01", weeks: 4, daysPerWeek: 3 });

    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/förlorar du din SGI/);
  });

  test("period som passerar ettårsdagen ger varning", () => {
    expect(warningsFor({ start: "2027-01-04", weeks: 2, daysPerWeek: 3 })).toHaveLength(1);
  });

  test("ingen varning om man jobbar de andra dagarna", () => {
    expect(
      warningsFor({ start: "2027-02-01", weeks: 4, daysPerWeek: 3, worksOtherDays: true })
    ).toEqual([]);
  });

  test("ingen varning vid 5 dagar/vecka", () => {
    expect(warningsFor({ start: "2027-02-01", weeks: 4, daysPerWeek: 5 })).toEqual([]);
  });

  test("ingen varning för period före ettårsdagen", () => {
    expect(warningsFor({ start: "2026-03-02", weeks: 10, daysPerWeek: 3 })).toEqual([]);
  });

  test("ingen varning utan födelsedatum", () => {
    const parent = withPeriods({ start: "2027-02-01", weeks: 4, daysPerWeek: 3 });
    expect(validateSgiProtection([parent], 1).warnings).toEqual([]);
  });

  test("förälder 2 räknas inte med för en ensamförälder", () => {
    const risky = withPeriods({ start: "2027-02-01", weeks: 4, daysPerWeek: 3 });

    expect(validateSgiProtection([withDays(240), risky], 1, BIRTH).warnings).toEqual([]);
    expect(validateSgiProtection([withDays(240), risky], 2, BIRTH).warnings).toHaveLength(1);
  });

  test("barn fött 29 februari fyller 1 år 28 februari", () => {
    // 2 veckor från 15 feb slutar 28 feb, från 14 feb slutar 27 feb
    expect(warningsFor({ start: "2025-02-15", weeks: 2, daysPerWeek: 3 }, "2024-02-29")).toHaveLength(1);
    expect(warningsFor({ start: "2025-02-14", weeks: 2, daysPerWeek: 3 }, "2024-02-29")).toEqual([]);
  });

  test("varningen gör inte planen ogiltig", () => {
    const parent = withPeriods({ start: "2027-02-01", weeks: 4, daysPerWeek: 3 });
    const result = validateAllRules([parent], 1, BIRTH);

    expect(result.allWarnings).toHaveLength(1);
    expect(result.isValid).toBe(true);
  });
});

describe("validateAllRules", () => {
  test("rimlig plan för två föräldrar godkänns", () => {
    const result = validateAllRules([withDays(195), withDays(195, "2026-12-14")], 2);

    expect(result.isValid).toBe(true);
    expect(result.allWarnings).toEqual([]);
  });

  // A1: högst 390 dagar på sjukpenningnivå, resten är lägstanivå.
  test("A1: fler än 390 dagar på sjukpenningnivå underkänns", () => {
    const result = validateAllRules([withDays(240), withDays(240, "2027-02-15")], 2);

    expect(result.isValid).toBe(false);
  });
});
