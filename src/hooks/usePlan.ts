// Planens tillstånd och allt som räknas fram ur det. Delas av den gamla vyn och
// den nya planeraren (Fas 3), så att båda redigerar samma plan.

import { useMemo, useState } from "react";
import { MonthlyData, Parent, ParentalPeriod, ParentBenefits } from "../types";
import { calculateParentBenefits, validateAllRules } from "../utils/calculations";
import { DEFAULT_TAX_RATE } from "../utils/tax";
import { createInitialParents, EXAMPLES, ExampleKey } from "../constants";
import { calculateDoubleDays, generatePeriodId, nextFreeStart } from "../utils/periodHelpers";
import { todayDate } from "../utils/dates";
import { buildMonthlyData } from "../utils/monthlyData";

export interface Plan {
  numParents: 1 | 2;
  birthDate: string;
  parents: Parent[];
  municipality: string;
  taxRate: number;
  isChurchMember: boolean;

  parentResults: ParentBenefits[];
  monthlyData: MonthlyData[];
  doubleDays: number;
  validation: ReturnType<typeof validateAllRules>;

  setNumParents: (numParents: 1 | 2) => void;
  setBirthDate: (date: string) => void;
  setMunicipality: (municipality: string, taxRate: number) => void;
  setIsChurchMember: (isChurchMember: boolean) => void;
  setParents: (parents: Parent[]) => void;
  updateParent: <K extends keyof Parent>(id: number, field: K, value: Parent[K]) => void;
  updatePeriod: <K extends keyof ParentalPeriod>(
    parentId: number,
    periodId: string,
    field: K,
    value: ParentalPeriod[K]
  ) => void;
  addPeriod: (parentId: number) => void;
  deletePeriod: (parentId: number, periodId: string) => void;
  loadExample: (key: ExampleKey) => void;
}

export const usePlan = (): Plan => {
  const [today] = useState(todayDate);
  const [numParents, setNumParents] = useState<1 | 2>(2);
  const [birthDate, setBirthDate] = useState<string>(today);
  const [parents, setParents] = useState<Parent[]>(() => createInitialParents(today));
  const [municipality, setMunicipalityName] = useState("");
  const [taxRate, setTaxRate] = useState<number>(DEFAULT_TAX_RATE);
  const [isChurchMember, setIsChurchMember] = useState(false);

  const parentResults = useMemo(
    () => parents.slice(0, numParents).map((parent) => calculateParentBenefits(parent, taxRate)),
    [parents, numParents, taxRate]
  );

  const doubleDays = useMemo(
    () => (numParents === 2 ? calculateDoubleDays(parents[0].periods, parents[1].periods) : 0),
    [parents, numParents]
  );

  const monthlyData = useMemo(
    () => buildMonthlyData(parents, numParents, parentResults, taxRate),
    [parents, numParents, parentResults, taxRate]
  );

  const validation = useMemo(
    () => validateAllRules(parents, numParents, birthDate),
    [parents, numParents, birthDate]
  );

  const mapParent = (id: number, change: (parent: Parent) => Parent) =>
    setParents((prev) => prev.map((p) => (p.id === id ? change(p) : p)));

  return {
    numParents,
    birthDate,
    parents,
    municipality,
    taxRate,
    isChurchMember,
    parentResults,
    monthlyData,
    doubleDays,
    validation,

    setNumParents,
    setBirthDate,
    setMunicipality: (name, rate) => {
      setMunicipalityName(name);
      setTaxRate(rate);
    },
    setIsChurchMember,
    setParents,
    updateParent: (id, field, value) => mapParent(id, (p) => ({ ...p, [field]: value })),
    updatePeriod: (parentId, periodId, field, value) =>
      mapParent(parentId, (p) => ({
        ...p,
        periods: p.periods.map((period) =>
          period.id === periodId ? { ...period, [field]: value } : period
        ),
      })),
    addPeriod: (parentId) =>
      mapParent(parentId, (p) => ({
        ...p,
        periods: [
          ...p.periods,
          {
            id: generatePeriodId(),
            start: nextFreeStart(p.periods),
            weeks: 6,
            daysPerWeek: 5,
            level: "high",
            worksOtherDays: false,
          },
        ],
      })),
    deletePeriod: (parentId, periodId) =>
      mapParent(parentId, (p) =>
        p.periods.length === 1
          ? p
          : { ...p, periods: p.periods.filter((period) => period.id !== periodId) }
      ),
    loadExample: (key) => {
      const example = EXAMPLES[key];
      setNumParents(example.parents.length as 1 | 2);
      setParents(example.parents);
    },
  };
};
