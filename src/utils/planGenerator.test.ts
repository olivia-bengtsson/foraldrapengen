import { Parent } from "../types";
import { createInitialParents } from "../constants";
import {
  answersFromPlan,
  generatePlan,
  QUICK_START_PRESETS,
  QuickStartAnswers,
} from "./planGenerator";
import { validateAllRules } from "./calculations";
import {
  calculateDoubleDays,
  daysByLevel,
  getTotalDaysFromPeriods,
  periodEnd,
  validateNoOverlap,
} from "./periodHelpers";
import { addDays } from "./dates";

const BIRTH = "2026-03-16";
const parents = createInitialParents(BIRTH);

const answers = (overrides: Partial<QuickStartAnswers> = {}): QuickStartAnswers => ({
  numParents: 2,
  birthDate: BIRTH,
  first: 0,
  months: [9, 9],
  daysPerWeek: 5,
  togetherWeeks: 0,
  salaries: [35000, 40000],
  topUp: [true, false],
  ...overrides,
});

const lastEnd = (parent: Parent) => periodEnd(parent.periods[parent.periods.length - 1]);
const levels = (parent: Parent) => parent.periods.map((p) => p.level);

describe("generatePlan", () => {
  test("förälder 1 från födseln, förälder 2 tar över dagen efter", () => {
    const [p1, p2] = generatePlan(answers(), parents);

    // 9 månader = 39 veckor = 195 dagar
    expect(p1.periods[0].start).toBe(BIRTH);
    expect(getTotalDaysFromPeriods(p1.periods)).toBe(195);
    expect(p2.periods[0].start).toBe(addDays(lastEnd(p1), 1));
    expect(calculateDoubleDays(p1.periods, p2.periods)).toBe(0);
  });

  test("first = 1 byter ordning", () => {
    const [p1, p2] = generatePlan(answers({ first: 1 }), parents);

    expect(p2.periods[0].start).toBe(BIRTH);
    expect(p1.periods[0].start).toBe(addDays(lastEnd(p2), 1));
  });

  test("tillsammans-perioden ligger hos den som börjar sedan och ger dubbeldagar", () => {
    const [p1, p2] = generatePlan(answers({ togetherWeeks: 2 }), parents);

    expect(p2.periods[0]).toMatchObject({ start: BIRTH, weeks: 2, daysPerWeek: 5 });
    expect(calculateDoubleDays(p1.periods, p2.periods)).toBe(10);
  });

  test("den andra börjar efter tillsammans-perioden om den första är hemma kortare", () => {
    const [p1, p2] = generatePlan(answers({ months: [0, 6], togetherWeeks: 8 }), parents);

    expect(p1.periods).toEqual([]);
    expect(p2.periods[1].start).toBe(addDays(BIRTH, 8 * 7));
    expect(validateNoOverlap(p2.periods).valid).toBe(true);
  });

  test("ingen förälder får överlappande egna perioder", () => {
    for (const preset of Object.values(QUICK_START_PRESETS)) {
      for (const parent of generatePlan(answers({ ...preset, togetherWeeks: 8 }), parents)) {
        expect(validateNoOverlap(parent.periods).valid).toBe(true);
      }
    }
  });

  test("upp till 90 sjukpenningdagar sparas åt den andra föräldern", () => {
    // Förälder 1 vill vara hemma 16 månader (69 veckor = 345 dagar)
    const [p1, p2] = generatePlan(answers({ months: [16, 6] }), parents);

    // 390 − 90 sparade = 300 dagar = 60 veckor på sjukpenningnivå, sedan lägstanivå
    expect(daysByLevel(p1.periods)).toEqual({ high: 300, low: 45 });
    expect(daysByLevel(p2.periods).high).toBe(90);
  });

  test("vill den andra vara hemma kortare sparas bara de dagarna", () => {
    // Förälder 2 i 4 månader = 17 veckor = 85 dagar
    const [p1, p2] = generatePlan(answers({ months: [16, 4] }), parents);

    expect(daysByLevel(p1.periods).high).toBe(305);
    expect(daysByLevel(p2.periods).high).toBe(85);
  });

  test("sjukpenningnivå först, sedan lägstanivå", () => {
    // 11 + 11 månader = 96 veckor = 480 dagar
    const [p1, p2] = generatePlan(answers({ months: [11, 11] }), parents);

    expect(levels(p1)).toEqual(["high"]);
    expect(levels(p2)).toEqual(["high", "low"]);
    expect(daysByLevel([...p1.periods, ...p2.periods])).toEqual({ high: 390, low: 90 });
    expect(validateAllRules([p1, p2], 2, BIRTH).validations.lowLevelDays.isValid).toBe(true);
  });

  test("för lång plan läggs ändå in och syns som för lång", () => {
    // 16 + 16 månader × 7 dagar/vecka = 2 × 483 dagar
    const [p1, p2] = generatePlan(answers({ months: [16, 16], daysPerWeek: 7 }), parents);
    const total = daysByLevel([...p1.periods, ...p2.periods]);

    expect(total.low).toBe(84);
    expect(total.high).toBeGreaterThan(390);
    expect(validateAllRules([p1, p2], 2, BIRTH).validations.levelDays.isValid).toBe(false);
  });

  test("ensamförälder kan vara hemma upp till 18 månader", () => {
    const [p1, p2] = generatePlan(answers({ numParents: 1, months: [18, 0] }), parents);

    // 78 veckor = 390 dagar på sjukpenningnivå
    expect(daysByLevel(p1.periods)).toEqual({ high: 390, low: 0 });
    expect(p2).toBe(parents[1]); // förälder 2 lämnas orörd
    expect(validateAllRules([p1], 1, BIRTH).allWarnings).toEqual([]);
  });

  test("lön och föräldralön från svaren, namn behålls", () => {
    const [p1, p2] = generatePlan(answers(), parents);

    expect(p1).toMatchObject({
      name: "Förälder 1",
      monthlySalary: 35000,
      topUpUnderCeilingPercent: 10,
      topUpOverCeilingPercent: 90,
      topUpDays: 180,
    });
    expect(p2).toMatchObject({
      monthlySalary: 40000,
      topUpUnderCeilingPercent: 0,
      topUpOverCeilingPercent: 0,
    });
    expect(p1.periods.every((p) => !p.worksOtherDays)).toBe(true);
  });
});

describe("QUICK_START_PRESETS", () => {
  test.each(Object.keys(QUICK_START_PRESETS) as Array<keyof typeof QUICK_START_PRESETS>)(
    "%s klarar alla regler",
    (key) => {
      const plan = generatePlan(answers(QUICK_START_PRESETS[key]), parents);
      expect(validateAllRules(plan, 2, BIRTH).allWarnings).toEqual([]);
    }
  );

  test("Så länge som möjligt använder alla 480 dagar", () => {
    const plan = generatePlan(answers(QUICK_START_PRESETS.longest), parents);
    expect(daysByLevel(plan.flatMap((p) => p.periods))).toEqual({ high: 390, low: 90 });
  });
});

describe("answersFromPlan", () => {
  test("startläget: 11 månader var, 5 dagar/vecka, förälder 1 först", () => {
    expect(answersFromPlan(parents, 2, BIRTH)).toEqual({
      numParents: 2,
      birthDate: BIRTH,
      first: 0,
      months: [11, 11],
      daysPerWeek: 5,
      togetherWeeks: 0,
      salaries: [35000, 35000],
      topUp: [true, true],
    });
  });

  test("svaren ger tillbaka samma svar efter generering", () => {
    const original = answers({ months: [8, 7.5], togetherWeeks: 4, daysPerWeek: 6, first: 1 });
    const plan = generatePlan(original, parents);

    expect(answersFromPlan(plan, 2, BIRTH)).toEqual(original);
  });
});
