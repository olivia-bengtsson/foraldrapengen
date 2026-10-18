import React from "react";
import { Plan } from "../../hooks/usePlan";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate, locales } from "../../i18n/translations";
import MunicipalitySelector from "../MunicipalitySelector";
import { weeksFromMonths } from "../../utils/periodHelpers";
import {
  DaysPerWeekOption,
  QUICK_START,
  QuickStartPresetKey,
  TogetherWeeksOption,
} from "../../utils/planGenerator";
import SegmentedControl from "./SegmentedControl";
import { QuickStart as QuickStartState } from "./useQuickStart";

interface QuickStartProps {
  plan: Plan;
  quickStart: QuickStartState;
  onFineTune: () => void;
}

const Question: React.FC<{
  id: string;
  label: string;
  help: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ id, label, help, hint, children }) => (
  <div className="grid gap-2" data-help={help}>
    <span id={id} className="font-semibold text-gray-800">
      {label}
    </span>
    {children}
    {hint && <p className="text-sm text-gray-500">{hint}</p>}
  </div>
);

const parentDot = ["bg-green-600", "bg-indigo-600"];

const QuickStart: React.FC<QuickStartProps> = ({ plan, quickStart, onFineTune }) => {
  const { t, language } = useLanguage();
  const { answers, changePeriods } = quickStart;
  const locale = locales[language];
  const two = answers.numParents === 2;
  const active: Array<0 | 1> = two ? [0, 1] : [0];
  const maxMonths = two ? QUICK_START.maxMonthsTwoParents : QUICK_START.maxMonthsOneParent;
  const name = (i: 0 | 1) => plan.parents[i].name;

  const presets: Array<{ key: QuickStartPresetKey; label: string }> = [
    { key: "equal", label: t.qsPresetEqual },
    { key: "longest", label: t.qsPresetLongest },
    { key: "moreMoney", label: t.qsPresetMoreMoney },
  ];

  const monthsText = (i: 0 | 1) => {
    const months = answers.months[i];
    if (months === 0) return t.qsMonthsNone;
    return interpolate(t.qsMonthsValue, {
      months: months.toLocaleString(locale),
      days: weeksFromMonths(months) * answers.daysPerWeek,
    });
  };

  const setMonths = (i: 0 | 1, months: number) => {
    const next: [number, number] = [...answers.months];
    next[i] = months;
    changePeriods({ months: next });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 grid gap-6">
      {quickStart.pendingOverwrite && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-900"
        >
          <span className="flex-1 min-w-[12rem]">{t.qsOverwriteNotice}</span>
          <button
            type="button"
            onClick={quickStart.applySuggestion}
            className="rounded-md border border-orange-500 px-3 py-1 font-semibold hover:bg-orange-100"
          >
            {t.qsOverwriteApply}
          </button>
        </div>
      )}

      <Question id="qs-presets" label={t.qsPresetsLabel} help="start">
        <div role="group" aria-labelledby="qs-presets" className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => quickStart.applyPreset(preset.key)}
              className="px-3 py-1.5 rounded-lg border border-green-600 text-green-800 text-sm font-semibold hover:bg-green-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Question>

      <Question id="qs-num-parents" label={t.qsNumParents} help="start">
        <SegmentedControl
          labelledBy="qs-num-parents"
          options={[
            { value: 1, label: t.qsOneParent },
            { value: 2, label: t.qsTwoParents },
          ]}
          value={answers.numParents}
          onChange={(numParents) => changePeriods({ numParents })}
        />
      </Question>

      <div className="grid gap-2" data-help="birth">
        <label htmlFor="qs-birth" className="font-semibold text-gray-800">
          {t.qsBirthDate}
        </label>
        <input
          id="qs-birth"
          type="date"
          value={answers.birthDate}
          onChange={(e) => e.target.value && changePeriods({ birthDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {two && (
        <Question id="qs-first" label={t.qsFirst} help="first">
          <SegmentedControl
            labelledBy="qs-first"
            options={[
              { value: 0, label: name(0) },
              { value: 1, label: name(1) },
            ]}
            value={answers.first}
            onChange={(first) => changePeriods({ first: first as 0 | 1 })}
          />
        </Question>
      )}

      <Question id="qs-months" label={t.qsMonths} help="months">
        {active.map((i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <label htmlFor={`qs-months-${i}`} className="flex items-center gap-2 text-sm">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${parentDot[i]}`} />
              {name(i)}
            </label>
            <output htmlFor={`qs-months-${i}`} className="text-sm text-gray-700 text-right tabular-nums">
              {monthsText(i)}
            </output>
            <input
              id={`qs-months-${i}`}
              type="range"
              min={0}
              max={maxMonths}
              step={QUICK_START.monthStep}
              value={answers.months[i]}
              onChange={(e) => setMonths(i, Number(e.target.value))}
              className="col-span-2 w-full accent-green-600"
            />
          </div>
        ))}
      </Question>

      <Question
        id="qs-dpw"
        label={t.qsDaysPerWeek}
        help="dpw"
        hint={t.qsDaysPerWeekHint}
      >
        <SegmentedControl
          labelledBy="qs-dpw"
          options={QUICK_START.daysPerWeekOptions.map((days) => ({
            value: days,
            label: interpolate(t.qsDaysOption, { days }),
          }))}
          value={answers.daysPerWeek}
          onChange={(daysPerWeek) => changePeriods({ daysPerWeek: daysPerWeek as DaysPerWeekOption })}
        />
      </Question>

      {two && (
        <Question id="qs-together" label={t.qsTogether} help="together" hint={t.qsTogetherHint}>
          <SegmentedControl
            labelledBy="qs-together"
            options={QUICK_START.togetherWeeksOptions.map((weeks) => ({
              value: weeks,
              label: weeks === 0 ? t.qsTogetherNo : interpolate(t.qsTogetherWeeks, { weeks }),
            }))}
            value={answers.togetherWeeks}
            onChange={(togetherWeeks) =>
              changePeriods({ togetherWeeks: togetherWeeks as TogetherWeeksOption })
            }
          />
        </Question>
      )}

      <Question id="qs-salary" label={t.qsSalary} help="salary">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {active.map((i) => (
            <label key={i} className="grid gap-1 text-sm text-gray-600">
              {name(i)}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                value={answers.salaries[i]}
                onChange={(e) => quickStart.changeSalary(i, Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </label>
          ))}
        </div>
      </Question>

      <div className="grid gap-2" data-help="topup">
        {active.map((i) => (
          <label key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={answers.topUp[i]}
              onChange={(e) => quickStart.changeTopUp(i, e.target.checked)}
              className="mt-0.5 accent-green-600"
            />
            {interpolate(t.qsTopUp, { name: name(i) })}
          </label>
        ))}
      </div>

      {/* Befintlig kommunväljare med egen rubrik; ny data i Fas 4 */}
      <div className="-mb-6" data-help="tax">
        <MunicipalitySelector
          selectedMunicipality={plan.municipality}
          onMunicipalityChange={plan.setMunicipality}
          isChurchMember={plan.isChurchMember}
          onChurchMemberChange={plan.setIsChurchMember}
        />
      </div>

      <button
        type="button"
        onClick={onFineTune}
        className="justify-self-start rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700"
      >
        {t.qsToDetailed}
      </button>
    </div>
  );
};

export default QuickStart;
