import { calculateParentBenefits, getMonthlyIncomeForParent } from "./calculations";
import { buildMonthlyData } from "./monthlyData";
import { createInitialParents } from "../constants";

const parents = createInitialParents("2026-03-16");
const results = parents.map((p) => calculateParentBenefits(p, 0.3));

describe("buildMonthlyData", () => {
  const months = buildMonthlyData(parents, 2, results, 0.3);

  test("från planens första till sista månad", () => {
    // Förälder 1 börjar 16 mars 2026, förälder 2 slutar 96 veckor senare (31 jan 2028)
    expect(months[0].month).toBe("2026-03");
    expect(months[months.length - 1].month).toBe("2028-01");
    expect(months).toHaveLength(23);
  });

  test("varje månad har samma värden som getMonthlyIncomeForParent", () => {
    const june = months.find((m) => m.month === "2026-06")!;
    const parent1 = getMonthlyIncomeForParent(parents[0], results[0], 2026, 5, 0.3);
    const parent2 = getMonthlyIncomeForParent(parents[1], results[1], 2026, 5, 0.3);

    expect(june.parent1Total).toBeCloseTo(parent1.total);
    expect(june.parent1Days).toBe(parent1.days);
    expect(june.parent2Total).toBeCloseTo(parent2.total);
    expect(june.parent2HighDays).toBeCloseTo(parent2.highDays);
  });

  test("ensamförälder har inga värden för förälder 2", () => {
    const single = buildMonthlyData(parents, 1, results.slice(0, 1), 0.3);

    expect(single[0].parent2Total).toBeUndefined();
    expect(single[single.length - 1].month).toBe("2027-02");
  });

  test("inga perioder ger inga månader", () => {
    const empty = parents.map((p) => ({ ...p, periods: [] }));
    expect(buildMonthlyData(empty, 2, results, 0.3)).toEqual([]);
  });
});
