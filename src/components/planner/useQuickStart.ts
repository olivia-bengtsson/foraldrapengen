// Snabbstart-svaren och hur de förs över till planen. Ligger i Planner så att svaren
// finns kvar när man byter flik.
//
// Antal föräldrar, födelsedatum, lön och föräldralön läses alltid från planen, så att
// ändringar i Detaljerad plan syns här. Bara Snabbstarts egna val sparas separat.

import { useState } from "react";
import { Plan } from "../../hooks/usePlan";
import { Parent } from "../../types";
import {
  answersFromPlan,
  generatePlan,
  QUICK_START_PRESETS,
  QuickStartAnswers,
  QuickStartPresetKey,
  topUpFields,
} from "../../utils/planGenerator";

type OwnAnswers = Pick<QuickStartAnswers, "first" | "months" | "daysPerWeek" | "togetherWeeks">;

export interface QuickStart {
  answers: QuickStartAnswers;
  /** Svaren har ändrats, men planen har redigerats för hand och skrivs inte över automatiskt */
  pendingOverwrite: boolean;
  /** Ändrar svar som styr perioderna. Genererar om planen om den inte redigerats för hand. */
  changePeriods: (patch: Partial<QuickStartAnswers>) => void;
  applyPreset: (key: QuickStartPresetKey) => void;
  applySuggestion: () => void;
  changeSalary: (index: 0 | 1, salary: number) => void;
  changeTopUp: (index: 0 | 1, enabled: boolean) => void;
}

const hasTopUp = (parent: Parent) =>
  parent.topUpUnderCeilingPercent > 0 || parent.topUpOverCeilingPercent > 0;

export const useQuickStart = (plan: Plan): QuickStart => {
  const [own, setOwn] = useState<OwnAnswers>(() => {
    const { first, months, daysPerWeek, togetherWeeks } = answersFromPlan(
      plan.parents,
      plan.numParents,
      plan.birthDate
    );
    return { first, months, daysPerWeek, togetherWeeks };
  });
  const [pendingOverwrite, setPendingOverwrite] = useState(false);

  const answers: QuickStartAnswers = {
    ...own,
    numParents: plan.numParents,
    birthDate: plan.birthDate,
    salaries: [plan.parents[0].monthlySalary, plan.parents[1].monthlySalary],
    topUp: [hasTopUp(plan.parents[0]), hasTopUp(plan.parents[1])],
  };

  const apply = (next: QuickStartAnswers) => {
    plan.applyQuickStart(next.numParents, next.birthDate, generatePlan(next, plan.parents));
    setPendingOverwrite(false);
  };

  const changePeriods = (patch: Partial<QuickStartAnswers>) => {
    const next = { ...answers, ...patch };
    const { first, months, daysPerWeek, togetherWeeks } = next;
    setOwn({ first, months, daysPerWeek, togetherWeeks });

    if (plan.planSource === "manual") {
      // Antal föräldrar och födelsedatum flyttar inga perioder och kan sättas direkt
      if (patch.numParents) plan.setNumParents(patch.numParents);
      if (patch.birthDate) plan.setBirthDate(patch.birthDate);
      setPendingOverwrite(true);
    } else {
      apply(next);
    }
  };

  return {
    answers,
    pendingOverwrite,
    changePeriods,
    applyPreset: (key) => changePeriods(QUICK_START_PRESETS[key]),
    applySuggestion: () => apply(answers),
    changeSalary: (index, salary) =>
      plan.updateParent(plan.parents[index].id, "monthlySalary", salary),
    changeTopUp: (index, enabled) => {
      const fields = topUpFields(enabled);
      const id = plan.parents[index].id;
      plan.updateParent(id, "topUpUnderCeilingPercent", fields.topUpUnderCeilingPercent);
      plan.updateParent(id, "topUpOverCeilingPercent", fields.topUpOverCeilingPercent);
      plan.updateParent(id, "topUpDays", fields.topUpDays);
    },
  };
};
