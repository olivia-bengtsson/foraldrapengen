import React, { useState } from "react";
import { Parent, ParentBenefits, ParentalPeriod } from "../types";
import {
  getTotalDaysFromPeriods,
  validateNoOverlap,
} from "../utils/periodHelpers";
import PeriodCard from "./PeriodCard";
import InfoTooltip from "./InfoTooltip";
import { useLanguage } from "../i18n/LanguageContext";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

interface ParentCardProps {
  parent: Parent;
  index: number;
  benefits: ParentBenefits;
  onUpdate: (field: keyof Parent, value: any) => void;
  onUpdatePeriod: (
    periodId: string,
    field: keyof ParentalPeriod,
    value: any
  ) => void;
  onAddPeriod: () => void;
  onDeletePeriod: (periodId: string) => void;
}

const ParentCard: React.FC<ParentCardProps> = ({
  parent,
  index,
  benefits,
  onUpdate,
  onUpdatePeriod,
  onAddPeriod,
  onDeletePeriod,
}) => {
  const { t, language } = useLanguage();
  const [showPeriods, setShowPeriods] = useState(false);

  // Calculate total days from all periods
  const totalDays = getTotalDaysFromPeriods(parent.periods);

  // Validate periods for overlap
  const validation = validateNoOverlap(parent.periods);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg">
          {index + 1}
        </div>
        <input
          type="text"
          value={parent.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          className="text-xl font-bold bg-white border border-gray-300 rounded px-3 py-2 flex-1 min-w-0"
        />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.monthlySalaryLabel}
            </label>
            <InfoTooltip
              title={t.salaryTooltipTitle}
              content={t.salaryTooltipContent}
              link="https://www.forsakringskassan.se/sjuk/berakna-sgi"
            />
          </div>
          <input
            type="number"
            value={parent.monthlySalary}
            onChange={(e) => onUpdate("monthlySalary", Number(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
            placeholder="35000"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.employerTopUpLabel}
            </label>
            <InfoTooltip
              title={t.pagTooltipTitle}
              content={t.pagTooltipContent}
              link="https://www.forsakringskassan.se/foralder/foraldrapenning/arbetsgivaren-betalar-mer"
            />
          </div>
          <input
            type="number"
            value={parent.employerTopUp}
            onChange={(e) => onUpdate("employerTopUp", Number(e.target.value))}
            min="0"
            max="100"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
            placeholder="10"
          />
        </div>

        {/* Periods Section */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowPeriods(!showPeriods)}
            className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showPeriods ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
              <span className="font-semibold text-gray-800">
                📅 {language === "sv" ? "Perioder" : "Periods"} (
                {parent.periods.length})
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {language === "sv" ? "Totalt:" : "Total:"}{" "}
              <span className="font-bold text-green-900">{totalDays}</span>{" "}
              {language === "sv" ? "dagar" : "days"}
            </div>
          </button>

          {!validation.valid && (
            <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
              ⚠️ {validation.message}
            </div>
          )}

          {showPeriods && (
            <div className="mt-4 space-y-3">
              {parent.periods.map((period, idx) => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  periodIndex={idx}
                  onUpdate={(field, value) =>
                    onUpdatePeriod(period.id, field, value)
                  }
                  onDelete={() => onDeletePeriod(period.id)}
                  canDelete={parent.periods.length > 1}
                  hasOverlapError={
                    !validation.valid &&
                    validation.overlappingPeriods?.includes(idx)
                  }
                />
              ))}

              <button
                onClick={onAddPeriod}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg border border-gray-300 transition-colors"
              >
                <Plus size={20} />
                <span className="font-semibold">
                  {language === "sv" ? "Lägg till period" : "Add period"}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-white rounded border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t.sgiLabel}</p>
              <p className="font-semibold text-green-900">
                {benefits.sgi.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr/år
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.dailyBenefitAfterTaxLabel}</p>
              <p className="font-semibold text-green-900">
                {benefits.dailyBenefitAfterTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr/dag
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.leaveLabel}</p>
              <p className="font-semibold text-green-900">
                {benefits.monthsNeeded.toFixed(1)} {t.monthsLabel}
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.highLevelDaysLabel}</p>
              <p className="font-semibold text-green-600">
                {benefits.highLevelDays} {t.daysLabel}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">{t.totalBenefitAfterTaxLabel}</p>
              <p className="font-semibold text-green-600 text-xl">
                {benefits.totalBenefitAfterTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentCard;
