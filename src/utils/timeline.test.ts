import { ParentalPeriod } from "../types";
import { toDayNumber } from "./dates";
import {
  axisTicks,
  coverageSegments,
  doubleDaySegments,
  spanPercent,
  timelineMarkers,
  timelineRange,
  toPercent,
} from "./timeline";

const BIRTH = "2026-03-16"; // måndag

const period = (overrides: Partial<ParentalPeriod> = {}): ParentalPeriod => ({
  id: "p",
  start: BIRTH,
  weeks: 4,
  daysPerWeek: 5,
  level: "high",
  worksOtherDays: false,
  ...overrides,
});

describe("timelineRange", () => {
  test("minst 18 månader", () => {
    expect(timelineRange(BIRTH, [period()])).toEqual({
      start: BIRTH,
      end: "2027-09-16",
      months: 18,
    });
  });

  test("längre plan ger längre spann, högst 30 månader", () => {
    // 96 veckor ≈ 22 månader
    expect(timelineRange(BIRTH, [period({ weeks: 96 })]).months).toBe(24);
    expect(timelineRange(BIRTH, [period({ weeks: 200 })]).months).toBe(30);
  });
});

describe("toPercent / spanPercent", () => {
  const range = timelineRange(BIRTH, []);

  test("födseln är 0 %, slutet 100 %, utanför begränsas", () => {
    expect(toPercent(toDayNumber(BIRTH), range)).toBe(0);
    expect(toPercent(toDayNumber(range.end), range)).toBe(100);
    expect(toPercent(toDayNumber(BIRTH) - 10, range)).toBe(0);
    expect(toPercent(toDayNumber(range.end) + 10, range)).toBe(100);
  });

  test("bredden räknar med slutdagen", () => {
    const { left, width } = spanPercent(BIRTH, BIRTH, range);
    expect(left).toBe(0);
    expect(width).toBeCloseTo(toPercent(toDayNumber(BIRTH) + 1, range));
  });
});

describe("axisTicks", () => {
  const range = timelineRange(BIRTH, []); // 18 månader

  test("första etiketten vid födseln", () => {
    expect(axisTicks(range, 1000)[0]).toEqual({ date: BIRTH, month: 0 });
  });

  test("smalare bredd ger större steg", () => {
    // 1000 px: 19 etiketter får plats → steg 1
    expect(axisTicks(range, 1000)).toHaveLength(19);
    // 300 px: 5 etiketter får plats → steg 4
    expect(axisTicks(range, 300).map((t) => t.month)).toEqual([0, 4, 8, 12, 16]);
    // 250 px: 4 etiketter → steg 6
    expect(axisTicks(range, 250).map((t) => t.month)).toEqual([0, 6, 12, 18]);
  });
});

describe("timelineMarkers", () => {
  test("barn fött 29 februari", () => {
    expect(timelineMarkers("2024-02-29")).toEqual({
      oneYear: "2025-02-28",
      fifteenMonths: "2025-05-29",
    });
  });
});

describe("doubleDaySegments", () => {
  const limit = "2027-06-16";
  const overlap = (start: string, end: string) => ({ start, end, daysPerWeek: 5, days: 0 });

  test("helt före gränsen", () => {
    expect(doubleDaySegments([overlap("2026-03-16", "2026-03-29")], limit)).toEqual([
      { start: "2026-03-16", end: "2026-03-29", days: 10, late: false },
    ]);
  });

  test("helt efter gränsen", () => {
    expect(doubleDaySegments([overlap("2027-06-16", "2027-06-29")], limit)[0].late).toBe(true);
  });

  test("delas vid gränsen", () => {
    expect(doubleDaySegments([overlap("2027-06-09", "2027-06-22")], limit)).toEqual([
      { start: "2027-06-09", end: "2027-06-15", days: 5, late: false },
      { start: "2027-06-16", end: "2027-06-22", days: 5, late: true },
    ]);
  });
});

describe("coverageSegments", () => {
  test("helt ledig med 3 dagar/vecka är full täckning", () => {
    expect(coverageSegments([period({ daysPerWeek: 3, worksOtherDays: false })], BIRTH)).toEqual([
      { start: BIRTH, end: "2026-04-12", coverage: "full" },
    ]);
  });

  test("3 dagar/vecka och jobbar övriga dagar är delvis täckning", () => {
    const segments = coverageSegments([period({ daysPerWeek: 3, worksOtherDays: true })], BIRTH);
    expect(segments.map((s) => s.coverage)).toEqual(["partial"]);
  });

  test("delvis period när den andra föräldern är hemma blir full", () => {
    const segments = coverageSegments(
      [
        period({ id: "a", daysPerWeek: 3, worksOtherDays: true, weeks: 4 }),
        period({ id: "b", start: "2026-03-30", weeks: 1 }), // vecka 3
      ],
      BIRTH
    );
    expect(segments).toEqual([
      { start: BIRTH, end: "2026-03-29", coverage: "partial" },
      { start: "2026-03-30", end: "2026-04-05", coverage: "full" },
      { start: "2026-04-06", end: "2026-04-12", coverage: "partial" },
    ]);
  });

  test("två delvis täckta perioder samtidigt är fortfarande delvis", () => {
    const partial = { daysPerWeek: 2, worksOtherDays: true };
    const segments = coverageSegments(
      [period({ id: "a", ...partial }), period({ id: "b", ...partial })],
      BIRTH
    );
    expect(segments.map((s) => s.coverage)).toEqual(["partial"]);
  });

  test("lucka vid födseln och mellan föräldrarna", () => {
    const segments = coverageSegments(
      [
        period({ id: "a", start: "2026-03-23", weeks: 2 }), // 23 mars – 5 april
        period({ id: "b", start: "2026-04-13", weeks: 1 }), // 13–19 april
      ],
      BIRTH
    );
    expect(segments).toEqual([
      { start: BIRTH, end: "2026-03-22", coverage: "gap" },
      { start: "2026-03-23", end: "2026-04-05", coverage: "full" },
      { start: "2026-04-06", end: "2026-04-12", coverage: "gap" },
      { start: "2026-04-13", end: "2026-04-19", coverage: "full" },
    ]);
  });

  test("perioder i följd slås ihop", () => {
    const segments = coverageSegments(
      [period({ id: "a", weeks: 2 }), period({ id: "b", start: "2026-03-30", weeks: 2 })],
      BIRTH
    );
    expect(segments).toEqual([{ start: BIRTH, end: "2026-04-12", coverage: "full" }]);
  });

  test("inga perioder", () => {
    expect(coverageSegments([], BIRTH)).toEqual([]);
  });
});
