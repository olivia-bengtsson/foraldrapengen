import { act, renderHook } from "@testing-library/react";
import { usePlan } from "../../hooks/usePlan";
import { useQuickStart } from "./useQuickStart";
import { getTotalDaysFromPeriods } from "../../utils/periodHelpers";

const setup = () =>
  renderHook(() => {
    const plan = usePlan();
    const quickStart = useQuickStart(plan);
    return { plan, quickStart };
  });

const totalDays = (r: ReturnType<typeof setup>["result"]) =>
  r.current.plan.parents.reduce((sum, p) => sum + getTotalDaysFromPeriods(p.periods), 0);

describe("useQuickStart", () => {
  test("svaren fylls i från planen och ändrar den inte", () => {
    const { result } = setup();

    expect(result.current.quickStart.answers.months).toEqual([11, 11]);
    expect(result.current.plan.planSource).toBe("initial");
  });

  test("ett förval ändrar en orörd plan direkt", () => {
    const { result } = setup();

    act(() => result.current.quickStart.applyPreset("moreMoney"));

    expect(result.current.plan.planSource).toBe("quickstart");
    expect(totalDays(result)).toBe(2 * 26 * 7);
    expect(result.current.quickStart.pendingOverwrite).toBe(false);
  });

  test("efter en ändring i en period sparas förvalet och visar raden om överskrivning", () => {
    const { result } = setup();
    const parent = result.current.plan.parents[0];

    act(() =>
      result.current.plan.updatePeriod(parent.id, parent.periods[0].id, "weeks", 10)
    );
    const before = totalDays(result);
    act(() => result.current.quickStart.applyPreset("moreMoney"));

    expect(result.current.quickStart.pendingOverwrite).toBe(true);
    expect(totalDays(result)).toBe(before);

    act(() => result.current.quickStart.applySuggestion());

    expect(result.current.quickStart.pendingOverwrite).toBe(false);
    expect(result.current.plan.planSource).toBe("quickstart");
    expect(totalDays(result)).toBe(2 * 26 * 7);
  });

  test("lön och föräldralön ändrar aldrig perioderna", () => {
    const { result } = setup();
    const periodsBefore = result.current.plan.parents[0].periods;

    act(() => result.current.quickStart.changeSalary(0, 50000));
    act(() => result.current.quickStart.changeTopUp(0, false));

    expect(result.current.plan.parents[0].periods).toBe(periodsBefore);
    expect(result.current.plan.parents[0].monthlySalary).toBe(50000);
    expect(result.current.plan.parents[0].topUpUnderCeilingPercent).toBe(0);
    expect(result.current.plan.planSource).toBe("initial");
  });

  test("ändringar i Detaljerad plan syns i svaren", () => {
    const { result } = setup();
    const parent = result.current.plan.parents[1];

    act(() => result.current.plan.updateParent(parent.id, "monthlySalary", 42000));
    act(() => result.current.plan.setBirthDate("2026-06-01"));

    expect(result.current.quickStart.answers.salaries[1]).toBe(42000);
    expect(result.current.quickStart.answers.birthDate).toBe("2026-06-01");
  });

  test("födelsedatum sätts direkt även när planen är ändrad för hand", () => {
    const { result } = setup();
    const parent = result.current.plan.parents[0];

    act(() => result.current.plan.addPeriod(parent.id));
    act(() => result.current.quickStart.changePeriods({ birthDate: "2026-07-01" }));

    expect(result.current.plan.birthDate).toBe("2026-07-01");
    expect(result.current.quickStart.pendingOverwrite).toBe(true);
  });
});
