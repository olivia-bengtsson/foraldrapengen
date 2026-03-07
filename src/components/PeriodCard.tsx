import React from "react";
import { Trash2 } from "lucide-react";
import { ParentalPeriod } from "../types";
import { useLanguage } from "../i18n/LanguageContext";

interface PeriodCardProps {
  period: ParentalPeriod;
  periodIndex: number;
  onUpdate: (field: keyof ParentalPeriod, value: any) => void;
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
  const { language } = useLanguage();

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
        {/* Datum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Startdatum" : "Start date"}
            </label>
            <input
              type="date"
              value={period.startDate}
              onChange={(e) => onUpdate("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Slutdatum" : "End date"}
            </label>
            <input
              type="date"
              value={period.endDate}
              onChange={(e) => onUpdate("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Dagar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Antal dagar" : "Number of days"}
            </label>
            <input
              type="number"
              min="0"
              max="480"
              value={period.daysToTake}
              onChange={(e) => onUpdate("daysToTake", Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
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
              onChange={(e) => onUpdate("daysPerWeek", Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Ersättningsnivå och Dubbeldag */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              value={period.level || "high"}
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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {language === "sv" ? "Dubbeldag" : "Double day"}
              <span
                className="ml-1 text-gray-400 cursor-help"
                title={
                  language === "sv"
                    ? "Dubbeldagar = båda föräldrar hemma samtidigt. Max 60 dagar, innan 15 månader. Räknas som 2 dagar totalt."
                    : "Double days = both parents at home together. Max 60 days, before 15 months. Counts as 2 days total."
                }
              >
                ℹ️
              </span>
            </label>
            <div className="flex items-center h-10 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <input
                type="checkbox"
                id={`doubleDay-${period.id}`}
                checked={period.isDoubleDay || false}
                onChange={(e) => onUpdate("isDoubleDay", e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label
                htmlFor={`doubleDay-${period.id}`}
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {language === "sv"
                  ? period.isDoubleDay
                    ? "Ja"
                    : "Nej"
                  : period.isDoubleDay
                    ? "Yes"
                    : "No"}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodCard;
