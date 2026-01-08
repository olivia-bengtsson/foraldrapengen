import React from "react";
import { Parent, ParentBenefits } from "../types";
import { getTotalDaysFromPeriods } from "../utils/periodHelpers";
import { useLanguage } from "../i18n/LanguageContext";

interface SummaryProps {
  parents: Parent[];
  parentResults: ParentBenefits[];
  totalBenefitAfterTax: number;
  totalBenefitBeforeTax: number;
  numParents: 1 | 2;
}

const Summary: React.FC<SummaryProps> = ({
  parents,
  parentResults,
  totalBenefitAfterTax,
  totalBenefitBeforeTax,
  numParents,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t.summaryTitle}
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-1">{t.totalBenefitLabel}</p>
          <p className="text-3xl font-bold text-blue-600">
            {totalBenefitAfterTax.toLocaleString("sv-SE", {
              maximumFractionDigits: 0,
            })}{" "}
            kr
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {t.beforeTaxLabel}:{" "}
            {totalBenefitBeforeTax.toLocaleString("sv-SE", {
              maximumFractionDigits: 0,
            })}{" "}
            kr
          </p>
        </div>

        {parents.slice(0, numParents).map((parent, idx) => (
          <div key={parent.id} className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800 mb-2">{parent.name}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t.leaveLabel}:</span>
                <span className="font-medium">
                  {parentResults[idx]?.monthsNeeded.toFixed(1)} {t.monthsLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.totalBenefitLabel}:</span>
                <span className="font-medium text-green-600">
                  {parentResults[idx]?.totalBenefitAfterTax.toLocaleString(
                    "sv-SE",
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  kr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t.highLevelDaysLabel}:</span>
                <span className="font-medium">
                  {parentResults[idx]?.highLevelDays} av{" "}
                  {getTotalDaysFromPeriods(parent.periods)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
