import React from "react";
import { Trash2 } from "lucide-react";
import { ParentalPeriod } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import { interpolate, locales } from "../i18n/translations";
import { formatDate } from "../utils/dates";
import { monthsFromWeeks, periodDays, periodEnd } from "../utils/periodHelpers";

interface PeriodCardProps {
  period: ParentalPeriod;
  periodIndex: number;
  onUpdate: <K extends keyof ParentalPeriod>(
    field: K,
    value: ParentalPeriod[K]
  ) => void;
  onDelete: () => void;
  canDelete: boolean;
  hasOverlapError?: boolean;
}

const PeriodCard: React.FC<PeriodCardProps> = ({
  period,
  periodIndex,
  onUpdate,
  onDelete,
  canDelete,
  hasOverlapError = false,
}) => {
  const { language, t } = useLanguage();
  const locale = locales[language];

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        hasOverlapError
          ? "border-red-300 bg-red-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">
          {language === "sv"
            ? `Period ${periodIndex + 1}`
            : `Period ${periodIndex + 1}`}
        </h4>
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
            title={language === "sv" ? "Ta bort period" : "Remove period"}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {hasOverlapError && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
          ⚠️{" "}
          {language === "sv"
            ? "Denna period överlappar med en annan period"
            : "This period overlaps with another period"}
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Startdatum" : "Start date"}
            </label>
            <input
              type="date"
              value={period.start}
              onChange={(e) => {
                if (e.target.value) onUpdate("start", e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t.periodWeeksLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={period.weeks}
                onChange={(e) =>
                  onUpdate("weeks", Math.max(1, Math.round(Number(e.target.value) || 1)))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {interpolate(t.periodApproxMonths, {
                  months: monthsFromWeeks(period.weeks).toLocaleString(locale),
                })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Dagar per vecka" : "Days per week"}
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={period.daysPerWeek}
              onChange={(e) =>
                onUpdate(
                  "daysPerWeek",
                  Math.min(7, Math.max(1, Math.round(Number(e.target.value) || 1)))
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Jobbar de andra dagarna (bara vid färre än 5 dagar/vecka) */}
        {period.daysPerWeek < 5 && (
          <fieldset>
            <legend className="block text-xs font-medium text-gray-600 mb-1">
              {t.worksOtherDaysQuestion}
            </legend>
            <div className="flex gap-2">
              {([false, true] as const).map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  aria-pressed={period.worksOtherDays === value}
                  onClick={() => onUpdate("worksOtherDays", value)}
                  className={`px-4 py-1.5 rounded-lg border text-sm ${
                    period.worksOtherDays === value
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {value ? t.worksOtherDaysYes : t.worksOtherDaysNo}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {interpolate(
                period.worksOtherDays
                  ? t.worksOtherDaysHelpYes
                  : t.worksOtherDaysHelpNo,
                {
                  days: period.worksOtherDays
                    ? 5 - period.daysPerWeek
                    : period.daysPerWeek,
                }
              )}
            </p>
          </fieldset>
        )}

        {/* Ersättningsnivå */}
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Ersättningsnivå" : "Benefit level"}
              <span
                className="ml-1 text-gray-400 cursor-help"
                title={
                  language === "sv"
                    ? "Sjukpenningnivå = ~80% av lön. Lägstanivå = 180 kr/dag. De första 180 dagarna måste vara sjukpenningnivå."
                    : "Sickness benefit level = ~80% of salary. Minimum level = 180 SEK/day. First 180 days must be sickness benefit level."
                }
              >
                ℹ️
              </span>
            </label>
            <select
              value={period.level}
              onChange={(e) =>
                onUpdate("level", e.target.value as "high" | "low")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="high">
                {language === "sv"
                  ? "Sjukpenningnivå (~80%)"
                  : "Sickness benefit level (~80%)"}
              </option>
              <option value="low">
                {language === "sv"
                  ? "Lägstanivå (180 kr/dag)"
                  : "Minimum level (180 SEK/day)"}
              </option>
            </select>
        </div>

        <p className="text-sm text-gray-700">
          {interpolate(t.periodSummary, {
            start: formatDate(period.start, locale),
            end: formatDate(periodEnd(period), locale),
            weeks: period.weeks,
            days: periodDays(period),
          })}
        </p>
      </div>
    </div>
  );
};

export default PeriodCard;
