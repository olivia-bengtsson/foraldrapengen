// Startläget och exemplen ska alltid följa reglerna (A1 m.fl.).

import { createInitialParents, EXAMPLES, ExampleKey } from "./index";
import { validateAllRules } from "../utils/calculations";
import { getTotalDaysFromPeriods } from "../utils/periodHelpers";

describe("createInitialParents", () => {
  const parents = createInitialParents("2026-03-16");

  test("klarar alla regler", () => {
    expect(validateAllRules(parents, 2).allWarnings).toEqual([]);
  });

  test("ger 195 + 45 dagar per förälder", () => {
    for (const parent of parents) {
      const high = parent.periods.filter((p) => p.level === "high");
      const low = parent.periods.filter((p) => p.level === "low");

      expect(getTotalDaysFromPeriods(high)).toBe(195);
      expect(getTotalDaysFromPeriods(low)).toBe(45);
    }
  });

  test("förälder 2 tar över dagen efter förälder 1", () => {
    expect(parents[0].periods[0].start).toBe("2026-03-16");
    expect(parents[1].periods[0].start).toBe("2027-02-15");
  });
});

describe("EXAMPLES", () => {
  test.each(Object.keys(EXAMPLES) as ExampleKey[])("%s klarar alla regler", (key) => {
    const { parents } = EXAMPLES[key];
    const numParents = parents.length === 1 ? 1 : 2;

    expect(validateAllRules(parents, numParents).allWarnings).toEqual([]);
  });
});
