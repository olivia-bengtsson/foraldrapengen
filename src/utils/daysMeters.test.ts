import { Parent, ParentalPeriod } from "../types";
import { createInitialParents } from "../constants";
import { daysMeters } from "./daysMeters";

const BIRTH = "2026-03-16";

const withPeriods = (parent: Parent, periods: Partial<ParentalPeriod>[]): Parent => ({
  ...parent,
  periods: periods.map((p, i) => ({
    id: `${parent.id}-${i}`,
    start: BIRTH,
    weeks: 4,
    daysPerWeek: 5,
    level: "high",
    worksOtherDays: false,
    ...p,
  })),
});

describe("daysMeters", () => {
  test("startläget använder alla 390 + 90 dagar", () => {
    const meters = daysMeters(createInitialParents(BIRTH), 2, BIRTH);

    expect(meters.high).toEqual({ perParent: [195, 195], used: 390, max: 390, remaining: 0, over: 0 });
    expect(meters.low).toEqual({ perParent: [45, 45], used: 90, max: 90, remaining: 0, over: 0 });
    expect(meters.double).toEqual({ perParent: [0], used: 0, max: 60, remaining: 60, over: 0, late: 0 });
  });

  test("för lång plan: dagar för mycket", () => {
    const [p1, p2] = createInitialParents(BIRTH);
    const parents = [
      withPeriods(p1, [{ weeks: 48 }]), // 240
      withPeriods(p2, [{ start: "2027-02-15", weeks: 48 }]), // 240
    ];
    const meters = daysMeters(parents, 2, BIRTH);

    expect(meters.high).toMatchObject({ perParent: [240, 240], used: 480, remaining: 0, over: 90 });
    expect(meters.low.used).toBe(0);
  });

  test("dubbeldagar och dubbeldagar efter 15 månader", () => {
    const [p1, p2] = createInitialParents(BIRTH);
    // Tillsammans 2 veckor vid födseln och 2 veckor från 15-månadersdagen (16 juni 2027)
    const together = [{ weeks: 2 }, { start: "2027-06-16", weeks: 2 }];
    const meters = daysMeters([withPeriods(p1, together), withPeriods(p2, together)], 2, BIRTH);

    expect(meters.double).toMatchObject({ used: 20, remaining: 40, late: 10 });
  });

  test("ensamförälder har ingen mätare för dubbeldagar", () => {
    const meters = daysMeters(createInitialParents(BIRTH), 1, BIRTH);

    expect(meters.double).toBeUndefined();
    expect(meters.high.perParent).toEqual([195]);
  });
});
