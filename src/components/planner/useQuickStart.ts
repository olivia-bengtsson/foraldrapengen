// Snabbstart-svaren och hur de förs över till planen. Ligger i Planner så att svaren
// finns kvar när man byter flik.

import { useState } from "react";
import { Plan } from "../../hooks/usePlan";
import {
  answersFromPlan,
  generatePlan,
  QUICK_START_PRESETS,
  QuickStartAnswers,
  QuickStartPresetKey,
  topUpFields,
} from "../../utils/planGenerator";

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

export const useQuickStart = (plan: Plan): QuickStart => {
  const [answers, setAnswers] = useState<QuickStartAnswers>(() =>
    answersFromPlan(plan.parents, plan.numParents, plan.birthDate)
  );
  const [pendingOverwrite, setPendingOverwrite] = useState(false);

  const apply = (next: QuickStartAnswers) => {
    plan.applyQuickStart(next.numParents, next.birthDate, generatePlan(next, plan.parents));
    setPendingOverwrite(false);
  };

  const changePeriods = (patch: Partial<QuickStartAnswers>) => {
    const next = { ...answers, ...patch };
    setAnswers(next);
    if (plan.planSource === "manual") setPendingOverwrite(true);
    else apply(next);
  };

  return {
    answers,
    pendingOverwrite,
    changePeriods,
    // Ett förval är ett aktivt val, så det skriver över direkt
    applyPreset: (key) => {
      const next = { ...answers, ...QUICK_START_PRESETS[key] };
      setAnswers(next);
      apply(next);
    },
    applySuggestion: () => apply(answers),
    changeSalary: (index, salary) => {
      const salaries: [number, number] = [...answers.salaries];
      salaries[index] = salary;
      setAnswers({ ...answers, salaries });
      plan.updateParent(plan.parents[index].id, "monthlySalary", salary);
    },
    changeTopUp: (index, enabled) => {
      const topUp: [boolean, boolean] = [...answers.topUp];
      topUp[index] = enabled;
      setAnswers({ ...answers, topUp });
      const fields = topUpFields(enabled);
      const id = plan.parents[index].id;
      plan.updateParent(id, "topUpUnderCeilingPercent", fields.topUpUnderCeilingPercent);
      plan.updateParent(id, "topUpOverCeilingPercent", fields.topUpOverCeilingPercent);
      plan.updateParent(id, "topUpDays", fields.topUpDays);
    },
  };
};
