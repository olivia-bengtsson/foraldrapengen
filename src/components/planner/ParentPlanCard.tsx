import React from "react";
import { Parent } from "../../types";
import { Plan } from "../../hooks/usePlan";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate, locales } from "../../i18n/translations";
import { formatDate, toDayNumber } from "../../utils/dates";
import {
  findPreviousOverlaps,
  monthsFromDays,
  nextFreeStart,
} from "../../utils/periodHelpers";
import PeriodRow from "./PeriodRow";

interface ParentPlanCardProps {
  plan: Plan;
  index: 0 | 1;
}

const COLORS = [
  { dot: "bg-green-600", border: "border-l-green-600" },
  { dot: "bg-indigo-600", border: "border-l-indigo-600" },
];

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white";
const labelClass = "grid gap-1 text-sm text-gray-600";

const clamp = (value: string, min: number, max: number) =>
  Math.min(max, Math.max(min, Number(value) || 0));

const ParentPlanCard: React.FC<ParentPlanCardProps> = ({ plan, index }) => {
  const { t, language } = useLanguage();
  const locale = locales[language];
  const parent = plan.parents[index];
  const color = COLORS[index];

  const update = <K extends keyof Parent>(field: K, value: Parent[K]) =>
    plan.updateParent(parent.id, field, value);

  const periods = [...parent.periods].sort(
    (a, b) => toDayNumber(a.start) - toDayNumber(b.start)
  );
  const overlaps = findPreviousOverlaps(parent.periods);
  const nextStart = periods.length ? nextFreeStart(periods) : plan.birthDate;

  return (
    <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={`inline-block w-3 h-3 rounded-full ${color.dot}`} />
        <input
          aria-label={t.dpNameLabel}
          value={parent.name}
          onChange={(e) => update("name", e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-transparent px-2 py-1 text-lg font-semibold text-gray-900 hover:border-gray-200 focus:border-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelClass} data-help="employment">
          {t.dpEmployment}
          <select
            value={parent.type}
            onChange={(e) => update("type", e.target.value as Parent["type"])}
            className={inputClass}
          >
            <option value="employed">{t.dpEmployed}</option>
            <option value="self_employed">{t.dpSelfEmployed}</option>
            <option value="unemployed">{t.dpUnemployed}</option>
          </select>
        </label>
        <label className={labelClass} data-help="salary">
          {t.monthlySalaryLabel}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            value={parent.monthlySalary}
            onChange={(e) => update("monthlySalary", clamp(e.target.value, 0, 1_000_000))}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-2" data-help="topup">
        <span className="text-sm font-semibold text-gray-800">{t.employerTopUpLabel}</span>
        {parent.type === "employed" ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <label className={labelClass}>
                {t.topUpUnderCeilingLabel}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={parent.topUpUnderCeilingPercent}
                  onChange={(e) =>
                    update("topUpUnderCeilingPercent", clamp(e.target.value, 0, 100))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                {t.topUpOverCeilingLabel}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={parent.topUpOverCeilingPercent}
                  onChange={(e) =>
                    update("topUpOverCeilingPercent", clamp(e.target.value, 0, 100))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                {t.topUpDaysLabel}
                <input
                  type="number"
                  min={0}
                  value={parent.topUpDays}
                  onChange={(e) =>
                    update("topUpDays", Math.round(clamp(e.target.value, 0, 730)))
                  }
                  className={inputClass}
                />
                <span className="text-xs text-gray-500">
                  {interpolate(t.periodApproxMonths, {
                    months: monthsFromDays(parent.topUpDays).toLocaleString(locale),
                  })}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500">{t.topUpHint}</p>
          </>
        ) : (
          <p className="text-sm text-gray-500">{t.dpTopUpOnlyEmployed}</p>
        )}
      </div>

      <div className="grid gap-3">
        {periods.length === 0 && <p className="text-sm text-gray-500">{t.dpNoPeriods}</p>}
        {periods.map((period, i) => (
          <PeriodRow
            key={period.id}
            period={period}
            index={i}
            borderClass={color.border}
            birthDate={plan.birthDate}
            overlap={overlaps[period.id]}
            canDelete={periods.length > 1}
            onChange={(field, value) => plan.updatePeriod(parent.id, period.id, field, value)}
            onDelete={() => plan.deletePeriod(parent.id, period.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => plan.addPeriod(parent.id)}
          className="rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-left font-medium text-gray-800 hover:border-green-600"
          data-help="weeks"
        >
          {interpolate(t.dpAddPeriod, { date: formatDate(nextStart, locale) })}
        </button>
      </div>
    </div>
  );
};

export default ParentPlanCard;
