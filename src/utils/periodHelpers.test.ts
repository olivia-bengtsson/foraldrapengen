import { ParentalPeriod } from "../types";
import {
  calculateDoubleDays,
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
      { start: "2026-03-02", end: "2026-03-15", days: 10 },
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
