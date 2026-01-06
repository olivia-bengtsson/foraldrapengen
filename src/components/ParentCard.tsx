import React from "react";
import { Parent, ParentBenefits } from "../types";
import InfoTooltip from "./InfoTooltip";
import { useLanguage } from "../i18n/LanguageContext";

interface ParentCardProps {
  parent: Parent;
  index: number;
  benefits: ParentBenefits;
  onUpdate: (field: keyof Parent, value: any) => void;
}

const ParentCard: React.FC<ParentCardProps> = ({
  parent,
  index,
  benefits,
  onUpdate,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {index + 1}
        </div>
        <input
          type="text"
          value={parent.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          className="text-xl font-bold bg-white border-2 border-indigo-300 rounded px-3 py-2 flex-1"
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
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
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
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            placeholder="10"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.daysToTakeLabel}
            </label>
            <InfoTooltip
              title={t.daysToTakeTooltipTitle}
              content={t.daysToTakeTooltipContent}
              link="https://www.forsakringskassan.se/foralder/foraldrapenning"
            />
          </div>
          <input
            type="number"
            value={parent.daysToTake}
            onChange={(e) => onUpdate("daysToTake", Number(e.target.value))}
            min="0"
            max="480"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            placeholder="240"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.daysPerWeekLabel}
            </label>
            <InfoTooltip
              title={t.daysPerWeekTooltipTitle}
              content={t.daysPerWeekTooltipContent}
              link="https://www.forsakringskassan.se/foralder/foraldrapenning/ta-ut-pa-deltid"
            />
          </div>
          <input
            type="number"
            min="1"
            max="7"
            value={parent.daysPerWeek}
            onChange={(e) => onUpdate("daysPerWeek", Number(e.target.value))}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            placeholder="5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.startDateLabel}
              </label>
              <InfoTooltip
                title={t.startDateTooltipTitle}
                content={t.startDateTooltipContent}
                link="https://www.forsakringskassan.se/foralder/foraldrapenning"
              />
            </div>
            <input
              type="date"
              value={parent.startDate}
              onChange={(e) => onUpdate("startDate", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.endDateCalculated}
            </label>
            <input
              type="date"
              value={parent.endDate}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t.sgiLabel}</p>
              <p className="font-semibold text-indigo-900">
                {benefits.sgi.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr/år
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.dailyBenefitAfterTaxLabel}</p>
              <p className="font-semibold text-indigo-900">
                {benefits.dailyBenefitAfterTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr/dag
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.leaveLabel}</p>
              <p className="font-semibold text-indigo-900">
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
