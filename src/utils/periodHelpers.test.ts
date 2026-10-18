import { Parent, ParentalPeriod } from "../types";
import { toDayNumber } from "./dates";
import {
  benefitDaysInRange,
  calculateDoubleDays,
  calendarDaysInRange,
  daysByLevel,
  getRemainingDays,
  getUsedDays,
  highLevelDaysBefore,
  overlapDaysFrom,
  getEarliestStartDate,
  getLatestEndDate,
  getOverlaps,
  getTotalDaysFromPeriods,
  monthsFromWeeks,
  nextFreeStart,
  periodDays,
  periodEnd,
  validateNoOverlap,
  weeksFromMonths,
} from "./periodHelpers";

const makePeriod = (overrides: Partial<ParentalPeriod> = {}): ParentalPeriod => ({
  id: "p1",
  start: "2026-03-02",
  weeks: 4,
  daysPerWeek: 5,
  level: "high",
  worksOtherDays: false,
  ...overrides,
});

describe("periodEnd", () => {
  test("startdagen är dag 1: en vecka från måndag slutar på söndag", () => {
    expect(periodEnd(makePeriod({ start: "2026-03-02", weeks: 1 }))).toBe("2026-03-08");
  });

  test("6 veckor från 21 mars 2027 slutar 1 maj 2027", () => {
    expect(periodEnd(makePeriod({ start: "2027-03-21", weeks: 6 }))).toBe("2027-05-01");
  });

  test("över sommartidens början flyttas inte datumet", () => {
    expect(periodEnd(makePeriod({ start: "2026-03-23", weeks: 2 }))).toBe("2026-04-05");
  });
});

describe("periodDays", () => {
  test("veckor × dagar per vecka", () => {
    expect(periodDays(makePeriod({ weeks: 48, daysPerWeek: 5 }))).toBe(240);
    expect(periodDays(makePeriod({ weeks: 34, daysPerWeek: 7 }))).toBe(238);
  });

  test("getTotalDaysFromPeriods summerar alla perioder", () => {
    const periods = [makePeriod({ weeks: 10 }), makePeriod({ weeks: 2, daysPerWeek: 3 })];
    expect(getTotalDaysFromPeriods(periods)).toBe(56);
  });
});

describe("veckor och månader", () => {
  test("weeksFromMonths avrundar till hela veckor", () => {
    expect(weeksFromMonths(6)).toBe(26);
    expect(weeksFromMonths(4)).toBe(17);
    expect(weeksFromMonths(0.5)).toBe(2);
  });

  test("monthsFromWeeks avrundar till halva månader", () => {
    expect(monthsFromWeeks(18)).toBe(4);
    expect(monthsFromWeeks(26)).toBe(6);
    expect(monthsFromWeeks(48)).toBe(11);
    expect(monthsFromWeeks(2)).toBe(0.5);
  });

  test("hela månader blir samma antal månader fram och tillbaka", () => {
    for (let months = 1; months <= 18; months++) {
      expect(monthsFromWeeks(weeksFromMonths(months))).toBe(months);
    }
  });
});

describe("nextFreeStart", () => {
  test("dagen efter förälderns sista period", () => {
    const periods = [
      makePeriod({ start: "2026-05-04", weeks: 2 }),
      makePeriod({ start: "2026-03-02", weeks: 4 }),
    ];
    expect(nextFreeStart(periods)).toBe("2026-05-18");
  });
});

describe("getOverlaps / calculateDoubleDays", () => {
  test("två veckors överlapp med 5 dagar/vecka ger 10 dubbeldagar", () => {
    const a = [makePeriod({ start: "2026-03-02", weeks: 13 })];
    const b = [makePeriod({ start: "2026-03-02", weeks: 2 })];

    expect(getOverlaps(a, b)).toEqual([
      { start: "2026-03-02", end: "2026-03-15", daysPerWeek: 5, days: 10 },
    ]);
    expect(calculateDoubleDays(a, b)).toBe(10);
  });

  test("lägsta dagar/vecka avgör", () => {
    const a = [makePeriod({ weeks: 2, daysPerWeek: 7 })];
    const b = [makePeriod({ weeks: 2, daysPerWeek: 3 })];

    expect(calculateDoubleDays(a, b)).toBe(6);
  });

  test("överlapp över sommartidsövergången räknas i hela dagar", () => {
    const a = [makePeriod({ start: "2026-03-23", weeks: 2, daysPerWeek: 7 })];
    const b = [makePeriod({ start: "2026-03-23", weeks: 2, daysPerWeek: 7 })];

    expect(calculateDoubleDays(a, b)).toBe(14);
  });

  test("perioder dag efter dag överlappar inte", () => {
    const a = [makePeriod({ start: "2026-03-02", weeks: 2 })];
    const b = [makePeriod({ start: "2026-03-16", weeks: 2 })];

    expect(getOverlaps(a, b)).toEqual([]);
    expect(calculateDoubleDays(a, b)).toBe(0);
  });
});

describe("validateNoOverlap", () => {
  test("perioder dag efter dag överlappar inte", () => {
    const periods = [
      makePeriod({ id: "a", start: "2026-03-02", weeks: 2 }),
      makePeriod({ id: "b", start: "2026-03-16", weeks: 2 }),
    ];

    expect(validateNoOverlap(periods).valid).toBe(true);
  });

  test("start samma dag som föregående period slutar överlappar", () => {
    const periods = [
      makePeriod({ id: "a", start: "2026-03-02", weeks: 2 }),
      makePeriod({ id: "b", start: "2026-03-15", weeks: 2 }),
    ];

    expect(validateNoOverlap(periods)).toMatchObject({
      valid: false,
      overlappingPeriods: [0, 1],
    });
  });
});

describe("getEarliestStartDate / getLatestEndDate", () => {
  const periods = [
    makePeriod({ start: "2026-05-04", weeks: 2 }),
    makePeriod({ start: "2026-03-02", weeks: 4 }),
  ];

  test("tidigaste start och senaste framräknade slut", () => {
    expect(getEarliestStartDate(periods)).toBe("2026-03-02");
    expect(getLatestEndDate(periods)).toBe("2026-05-17");
  });
});

describe("overlapDaysFrom", () => {
  const overlap = { start: "2026-03-02", end: "2026-03-15", daysPerWeek: 5, days: 10 };

  test("dagar på eller efter datumet", () => {
    expect(overlapDaysFrom(overlap, "2026-03-09")).toBe(5);
    expect(overlapDaysFrom(overlap, "2026-03-01")).toBe(10);
    expect(overlapDaysFrom(overlap, "2026-03-16")).toBe(0);
  });
});

describe("highLevelDaysBefore", () => {
  const periods = [
    makePeriod({ start: "2026-03-02", weeks: 4 }), // 20 dagar
    makePeriod({ start: "2026-03-30", weeks: 4, level: "low" }),
    makePeriod({ start: "2026-04-27", weeks: 4 }), // 20 dagar
  ];

  test("räknar bara sjukpenningnivå före datumet", () => {
    expect(highLevelDaysBefore(periods, "2026-03-02")).toBe(0);
    expect(highLevelDaysBefore(periods, "2026-04-27")).toBe(20);
    expect(highLevelDaysBefore(periods, "2027-01-01")).toBe(40);
  });

  test("pågående period räknas med andelen före datumet", () => {
    expect(highLevelDaysBefore(periods, "2026-03-16")).toBe(10);
  });
});

describe("getUsedDays / getRemainingDays (A4)", () => {
  const parent = (periods: ParentalPeriod[]): Parent => ({
    id: 1,
    name: "Förälder",
    type: "employed",
    monthlySalary: 35000,
    topUpUnderCeilingPercent: 0,
    topUpOverCeilingPercent: 0,
    topUpDays: 180,
    periods,
  });

  test("dubbeldagar räknas inte en gång till", () => {
    // Båda lediga samma 20 veckor: 100 dubbeldagar, 200 förbrukade dagar
    const parents = [parent([makePeriod({ weeks: 20 })]), parent([makePeriod({ weeks: 20 })])];

    expect(calculateDoubleDays(parents[0].periods, parents[1].periods)).toBe(100);
    expect(getUsedDays(parents, 2)).toBe(200);
    expect(getRemainingDays(parents, 2)).toBe(280);
  });

  test("ensamförälder räknar bara förälder 1", () => {
    const parents = [parent([makePeriod({ weeks: 20 })]), parent([makePeriod({ weeks: 20 })])];

    expect(getUsedDays(parents, 1)).toBe(100);
  });
});

describe("daysByLevel", () => {
  test("summerar dagar per nivå", () => {
    const periods = [
      makePeriod({ weeks: 10 }),
      makePeriod({ weeks: 4, level: "low" }),
      makePeriod({ weeks: 2, daysPerWeek: 3 }),
    ];
    expect(daysByLevel(periods)).toEqual({ high: 56, low: 20 });
  });

  test("inga perioder", () => {
    expect(daysByLevel([])).toEqual({ high: 0, low: 0 });
  });
});

describe("calendarDaysInRange / benefitDaysInRange", () => {
  // 2–29 mars 2026, 4 veckor
  const period = makePeriod({ start: "2026-03-02", weeks: 4, daysPerWeek: 5 });

  test("hela perioden", () => {
    expect(calendarDaysInRange(period)).toBe(28);
    expect(benefitDaysInRange(period)).toBe(periodDays(period));
  });

  test("del av perioden", () => {
    // 2–8 mars
    const from = toDayNumber("2026-03-02");
    const to = toDayNumber("2026-03-08");
    expect(calendarDaysInRange(period, from, to)).toBe(7);
    expect(benefitDaysInRange(period, from, to)).toBe(5);
  });

  test("utanför perioden", () => {
    const day = toDayNumber("2026-04-01");
    expect(calendarDaysInRange(period, day, day + 10)).toBe(0);
  });
});
