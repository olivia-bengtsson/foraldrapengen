import React from "react";
import { Parent } from "../../types";
import { getTotalDaysFromPeriods } from "../../utils/periodHelpers";
import InfoTooltip from "../InfoTooltip";
import { useLanguage } from "../../i18n/LanguageContext";

interface DaysSummaryProps {
  parents: Parent[];
  numParents: 1 | 2;
  calculatedDoubleDays: number;
}

const DaysSummary: React.FC<DaysSummaryProps> = ({
  parents,
  numParents,
  calculatedDoubleDays,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-green-900 mb-4">
        {language === "sv" ? "Dagfördelning" : "Days Breakdown"}
      </h4>

      {/* Days breakdown */}
      <div className="space-y-3 mb-4">
        {parents.slice(0, numParents).map((parent) => (
          <div key={parent.id} className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{parent.name}:</span>
            <span className="text-lg font-semibold text-green-900">
              {getTotalDaysFromPeriods(parent.periods)}{" "}
              {language === "sv" ? "dagar" : "days"}
            </span>
          </div>
        ))}

        {numParents === 2 && (
          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {t.doubleDaysLabel}:
              </span>
              <InfoTooltip
                title={t.doubleDaysTooltipTitle}
                content={
                  language === "sv"
                    ? "När båda föräldrar tar ut samtidigt används extra dagar från totalen. Exempel: 30 dubbeldagar = båda tar 30 dagar samtidigt = 60 dagar från 480-poolen."
                    : "When both parents take leave simultaneously, extra days are used from the total. Example: 30 double days = both take 30 days simultaneously = 60 days from the 480 pool."
                }
                link="https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning/foraldralediga-tillsammans---dubbeldagar"
              />
            </div>
            <span
              className={`text-lg font-semibold ${
                calculatedDoubleDays > 60 ? "text-red-700" : "text-green-900"
              }`}
            >
              {calculatedDoubleDays} {language === "sv" ? "dagar" : "days"}
            </span>
          </div>
        )}

        {/* Total taken */}
        <div className="flex justify-between items-center pt-3 border-t-2 border-green-300">
          <span className="text-base font-semibold text-gray-800">
            {language === "sv" ? "Totalt tagna:" : "Total taken:"}
          </span>
          <span className="text-xl font-bold text-green-900">
            {parents
              .slice(0, numParents)
              .reduce((sum, p) => sum + getTotalDaysFromPeriods(p.periods), 0) +
              calculatedDoubleDays}{" "}
            / 480 {language === "sv" ? "dagar" : "days"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DaysSummary;
