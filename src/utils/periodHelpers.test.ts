import { ParentalPeriod } from "../types";
import {
  calculateDoubleDays,
  getDateAfterDays,
  getEarliestStartDate,
  getLatestEndDate,
  validateNoOverlap,
} from "./periodHelpers";

const makePeriod = (overrides: Partial<ParentalPeriod> = {}): ParentalPeriod => ({
  id: "p1",
  startDate: "2026-03-02",
  endDate: "2026-03-29",
  daysToTake: 20,
  daysPerWeek: 5,
  level: "high",
  ...overrides,
});

describe("getDateAfterDays", () => {
  test("5 dagar med 5 dagar/vecka är 7 kalenderdagar", () => {
    expect(getDateAfterDays("2026-03-02", 5, 5)).toBe("2026-03-09");
  });

  test("över sommartidens början flyttas inte datumet", () => {
    expect(getDateAfterDays("2026-03-23", 10, 5)).toBe("2026-04-06");
  });

  test("ogiltigt startdatum ger ett giltigt datum i stället för att krascha", () => {
    expect(getDateAfterDays("", 5, 5)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("calculateDoubleDays", () => {
  test("två veckors överlapp med 5 dagar/vecka ger 10 dubbeldagar", () => {
    const a = [makePeriod({ startDate: "2026-03-02", endDate: "2026-05-31" })];
    const b = [makePeriod({ startDate: "2026-03-02", endDate: "2026-03-15" })];

    expect(calculateDoubleDays(a, b)).toBe(10);
  });

  test("lägsta dagar/vecka avgör", () => {
    const a = [makePeriod({ startDate: "2026-03-02", endDate: "2026-03-15", daysPerWeek: 7 })];
    const b = [makePeriod({ startDate: "2026-03-02", endDate: "2026-03-15", daysPerWeek: 3 })];

    expect(calculateDoubleDays(a, b)).toBe(6);
  });

  test("överlapp över sommartidsövergången räknas i hela dagar", () => {
    const a = [makePeriod({ startDate: "2026-03-23", endDate: "2026-04-05", daysPerWeek: 7 })];
    const b = [makePeriod({ startDate: "2026-03-23", endDate: "2026-04-05", daysPerWeek: 7 })];

    expect(calculateDoubleDays(a, b)).toBe(14);
  });

  test("perioder som inte överlappar ger 0", () => {
    const a = [makePeriod({ startDate: "2026-03-02", endDate: "2026-03-15" })];
    const b = [makePeriod({ startDate: "2026-03-16", endDate: "2026-03-31" })];

    expect(calculateDoubleDays(a, b)).toBe(0);
  });
});

describe("validateNoOverlap", () => {
  test("perioder dag efter dag överlappar inte", () => {
    const periods = [
      makePeriod({ id: "a", startDate: "2026-03-02", endDate: "2026-03-15" }),
      makePeriod({ id: "b", startDate: "2026-03-16", endDate: "2026-03-31" }),
    ];

    expect(validateNoOverlap(periods).valid).toBe(true);
  });

  test("samma slut- och startdag överlappar", () => {
    const periods = [
      makePeriod({ id: "a", startDate: "2026-03-02", endDate: "2026-03-15" }),
      makePeriod({ id: "b", startDate: "2026-03-15", endDate: "2026-03-31" }),
    ];

    expect(validateNoOverlap(periods)).toMatchObject({
      valid: false,
      overlappingPeriods: [0, 1],
    });
  });
});

describe("getEarliestStartDate / getLatestEndDate", () => {
  const periods = [
    makePeriod({ startDate: "2026-05-01", endDate: "2026-06-30" }),
    makePeriod({ startDate: "2026-03-01", endDate: "2026-04-30" }),
  ];

  test("ger tidigaste start och senaste slut som samma datum som i perioderna", () => {
    expect(getEarliestStartDate(periods)).toBe("2026-03-01");
    expect(getLatestEndDate(periods)).toBe("2026-06-30");
  });
});
