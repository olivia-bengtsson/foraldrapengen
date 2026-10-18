import { act, renderHook } from "@testing-library/react";
import { usePlan } from "./usePlan";
import { calculateParentBenefits } from "../utils/calculations";
import { DEFAULT_TAX_RATE } from "../utils/tax";
import { buildMonthlyData } from "../utils/monthlyData";

describe("usePlan", () => {
  test("startläget räknas med samma funktioner som tidigare", () => {
    const { result } = renderHook(() => usePlan());
    const plan = result.current;

    expect(plan.numParents).toBe(2);
    expect(plan.taxRate).toBe(DEFAULT_TAX_RATE);
    expect(plan.parentResults).toEqual(
      plan.parents.map((p) => calculateParentBenefits(p, DEFAULT_TAX_RATE))
    );
    expect(plan.monthlyData).toEqual(
      buildMonthlyData(plan.parents, 2, plan.parentResults, DEFAULT_TAX_RATE)
    );
    expect(plan.doubleDays).toBe(0);
    expect(plan.validation.allWarnings).toEqual([]);
  });

  test("updatePeriod och updateParent ändrar rätt förälder och period", () => {
    const { result } = renderHook(() => usePlan());
    const parent = result.current.parents[0];
    const period = parent.periods[0];

    act(() => result.current.updatePeriod(parent.id, period.id, "weeks", 10));
    act(() => result.current.updateParent(parent.id, "monthlySalary", 40000));

    expect(result.current.parents[0].periods[0].weeks).toBe(10);
    expect(result.current.parents[0].monthlySalary).toBe(40000);
    expect(result.current.parentResults[0].highLevelDays).toBe(50);
  });

  test("addPeriod börjar dagen efter förälderns sista period, deletePeriod behåller minst en", () => {
    const { result } = renderHook(() => usePlan());
    const parent = result.current.parents[0];

    act(() => result.current.addPeriod(parent.id));
    const periods = result.current.parents[0].periods;
    expect(periods).toHaveLength(3);
    expect(periods[2].weeks).toBe(6);

    act(() => result.current.deletePeriod(parent.id, periods[2].id));
    act(() => result.current.deletePeriod(parent.id, periods[1].id));
    act(() => result.current.deletePeriod(parent.id, periods[0].id));
    expect(result.current.parents[0].periods).toHaveLength(1);
  });

  test("kommun sätter skattesatsen och räknas in i beloppen", () => {
    const { result } = renderHook(() => usePlan());

    act(() => result.current.setMunicipality("Stockholm", 0.3));
    const at30 = result.current.parentResults[0].totalBenefitAfterTax;
    act(() => result.current.setMunicipality("Annan", 0.35));

    expect(result.current.municipality).toBe("Annan");
    expect(result.current.parentResults[0].totalBenefitAfterTax).toBeLessThan(at30);
  });

  test("loadExample byter antal föräldrar och perioder", () => {
    const { result } = renderHook(() => usePlan());

    act(() => result.current.loadExample("singleParent"));

    expect(result.current.numParents).toBe(1);
    expect(result.current.parentResults).toHaveLength(1);
  });

  test("planSource: manual vid periodändringar, quickstart vid förslag, oförändrad vid lön", () => {
    const { result } = renderHook(() => usePlan());
    const parent = result.current.parents[0];
    expect(result.current.planSource).toBe("initial");

    act(() => result.current.updateParent(parent.id, "monthlySalary", 40000));
    expect(result.current.planSource).toBe("initial");

    act(() => result.current.updatePeriod(parent.id, parent.periods[0].id, "weeks", 10));
    expect(result.current.planSource).toBe("manual");

    act(() =>
      result.current.applyQuickStart(1, "2026-05-01", result.current.parents)
    );
    expect(result.current.planSource).toBe("quickstart");
    expect(result.current.numParents).toBe(1);
    expect(result.current.birthDate).toBe("2026-05-01");

    act(() => result.current.loadExample("maxTime"));
    expect(result.current.planSource).toBe("manual");
  });

  test("addPeriod utan perioder börjar på födelsedatumet", () => {
    const { result } = renderHook(() => usePlan());
    const empty = result.current.parents.map((p) => ({ ...p, periods: [] }));

    act(() => result.current.applyQuickStart(2, "2026-05-01", empty));
    act(() => result.current.addPeriod(empty[0].id));

    expect(result.current.parents[0].periods[0].start).toBe("2026-05-01");
  });
});
