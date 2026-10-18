import React from "react";
import { ParentalPeriod } from "../../types";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate, locales } from "../../i18n/translations";
import { RULES } from "../../rules";
import { formatDate } from "../../utils/dates";
import {
  monthsFromWeeks,
  periodDays,
  periodEnd,
  PreviousOverlap,
} from "../../utils/periodHelpers";
import SegmentedControl from "./SegmentedControl";

interface PeriodRowProps {
  period: ParentalPeriod;
  index: number;
  /** Tailwind-klass för förälderns färg på vänsterkanten */
  borderClass: string;
  birthDate: string;
  overlap?: PreviousOverlap;
  canDelete: boolean;
  onChange: <K extends keyof ParentalPeriod>(field: K, value: ParentalPeriod[K]) => void;
  onDelete: () => void;
}

const inputClass = "w-full px-2 py-1.5 border border-gray-300 rounded-md bg-white text-sm";
const labelClass = "grid gap-1 text-xs text-gray-600";

/** Tal från ett formulärfält, avrundat och begränsat */
const toInt = (value: string, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number(value) || min)));

const PeriodRow: React.FC<PeriodRowProps> = ({
  period,
  index,
  borderClass,
  birthDate,
  overlap,
  canDelete,
  onChange,
  onDelete,
}) => {
  const { t, language } = useLanguage();
  const locale = locales[language];
  const worksId = `works-${period.id}`;

  return (
    <div
      id={`period-${period.id}`}
      className={`grid gap-3 rounded-lg border border-gray-200 border-l-4 ${borderClass} bg-gray-50 p-3`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          {interpolate(t.dpPeriodLabel, { number: index + 1 })}
        </h4>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-gray-500 underline hover:text-gray-800"
          >
            {t.dpRemovePeriod}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr]">
        <label className={labelClass} data-help="start">
          {t.startDateLabel}
          <input
            type="date"
            value={period.start}
            min={birthDate}
            onChange={(e) => e.target.value && onChange("start", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass} data-help="weeks">
          {t.periodWeeksLabel}
          <input
            type="number"
            min={1}
            step={1}
            value={period.weeks}
            onChange={(e) => onChange("weeks", toInt(e.target.value, 1, 200))}
            className={inputClass}
          />
          <span className="text-gray-500">
            {interpolate(t.periodApproxMonths, {
              months: monthsFromWeeks(period.weeks).toLocaleString(locale),
            })}
          </span>
        </label>
        <label className={labelClass} data-help="dpw">
          {t.daysPerWeekLabel}
          <select
            value={period.daysPerWeek}
            onChange={(e) => onChange("daysPerWeek", Number(e.target.value))}
            className={inputClass}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((days) => (
              <option key={days} value={days}>
                {days}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass} data-help="level">
          {t.dpLevel}
          <select
            value={period.level}
            onChange={(e) => onChange("level", e.target.value as ParentalPeriod["level"])}
            className={inputClass}
          >
            <option value="high">{t.dpLevelHigh}</option>
            <option value="low">
              {interpolate(t.dpLevelLow, { amount: RULES.benefit.lowLevelDaily })}
            </option>
          </select>
        </label>
      </div>

      {period.daysPerWeek < 5 && (
        <div className="grid gap-1" data-help="worksOtherDays">
          <span id={worksId} className="text-xs font-medium text-gray-600">
            {t.worksOtherDaysQuestion}
          </span>
          <SegmentedControl
            labelledBy={worksId}
            options={[
              { value: "no", label: t.worksOtherDaysNo },
              { value: "yes", label: t.worksOtherDaysYes },
            ]}
            value={period.worksOtherDays ? "yes" : "no"}
            onChange={(value) => onChange("worksOtherDays", value === "yes")}
          />
          <p className="text-xs text-gray-500">
            {interpolate(
              period.worksOtherDays ? t.worksOtherDaysHelpYes : t.worksOtherDaysHelpNo,
              { days: period.worksOtherDays ? 5 - period.daysPerWeek : period.daysPerWeek }
            )}
          </p>
        </div>
      )}

      {overlap && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-900">
          <span>
            {interpolate(t.dpOverlap, { date: formatDate(overlap.previousEnd, locale) })}
          </span>
          <button
            type="button"
            onClick={() => onChange("start", overlap.moveTo)}
            className="rounded-md border border-orange-500 px-2 py-0.5 hover:bg-orange-100"
          >
            {interpolate(t.dpMoveStart, { date: formatDate(overlap.moveTo, locale) })}
          </button>
        </div>
      )}

      <p className="text-sm font-medium text-gray-800 tabular-nums">
        {interpolate(t.periodSummary, {
          start: formatDate(period.start, locale),
          end: formatDate(periodEnd(period), locale),
          weeks: period.weeks,
          days: periodDays(period),
        })}
      </p>
    </div>
  );
};

export default PeriodRow;
