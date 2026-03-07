import React, { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { MonthlyData } from "../types";
import { useLanguage } from "../i18n/LanguageContext";

interface MonthlyIncomeTableProps {
  monthlyData: MonthlyData[];
  numParents: 1 | 2;
  doubleDays: number;
  parent1Name?: string;
  parent2Name?: string;
}

const MonthlyIncomeTable: React.FC<MonthlyIncomeTableProps> = ({
  monthlyData,
  numParents,
  doubleDays,
  parent1Name = "Förälder 1",
  parent2Name = "Förälder 2",
}) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  // Check if any month has double days (both parents have days)
  const hasDoubleDays =
    numParents === 2 &&
    monthlyData.some(
      (data) => data.parent1Days > 0 && (data.parent2Days ?? 0) > 0,
    );

  // Check if exceeding 60 double days limit
  const exceedsLimit = doubleDays > 60;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 border border-gray-200">
      {/* Header with collapse button */}
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp size={20} />
          {t.monthlyIncomeTitle}
        </h3>
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isExpanded ? "Kollapsa" : "Expandera"}
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {isExpanded && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {t.monthlyIncomeSubtitle}
          </p>

          {/* Legend for day types */}
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-700">
                💡 {language === "sv" ? "Förklaring:" : "Explanation:"}
              </span>
            </p>
            <ul className="text-xs text-gray-700 mt-2 space-y-1">
              <li>
                <span className="text-green-700 font-medium">👶 Grön</span> ={" "}
                {language === "sv"
                  ? "Sjukpenningnivå (~80% av lön + PAG)"
                  : "Sickness benefit level (~80% salary + employer top-up)"}
              </li>
              <li>
                <span className="text-orange-600 font-medium">⚠️ Orange</span> ={" "}
                {language === "sv"
                  ? "Lägstanivå (180 kr/dag, utan PAG)"
                  : "Minimum level (180 SEK/day, no employer top-up)"}
              </li>
              <li>
                <span className="text-gray-400 font-medium">💼 Grå</span> ={" "}
                {language === "sv" ? "Arbetar (lön)" : "Working (salary)"}
              </li>
            </ul>
          </div>

          {/* Double days explanation */}
          {hasDoubleDays && (
            <div
              className={`mb-4 p-3 border-l-4 rounded ${
                exceedsLimit
                  ? "bg-red-50 border-red-500"
                  : "bg-orange-50 border-orange-500"
              }`}
            >
              <p className="text-sm text-gray-700">
                <span
                  className={`font-semibold ${
                    exceedsLimit ? "text-red-700" : "text-orange-700"
                  }`}
                >
                  {exceedsLimit ? "⚠️" : "🟠"}{" "}
                  {language === "sv"
                    ? exceedsLimit
                      ? `Varning: ${doubleDays} dubbeldagar (max 60 tillåts)`
                      : "Orange = Dubbeldagar"
                    : exceedsLimit
                      ? `Warning: ${doubleDays} double days (max 60 allowed)`
                      : "Orange = Double days"}
                  :
                </span>{" "}
                {language === "sv"
                  ? exceedsLimit
                    ? "Du har planerat för många dubbeldagar. Minska antalet dubbeldagar eller föräldrars totala dagar."
                    : "Månader där båda föräldrar tar ut föräldrapenning samtidigt."
                  : exceedsLimit
                    ? "You have planned too many double days. Reduce double days or parents' total days."
                    : "Months where both parents take parental leave simultaneously."}
              </p>
            </div>
          )}

          {/* Mobile view - Card layout */}
          <div className="md:hidden space-y-3">
            {monthlyData.map((data, index) => {
              const isDoubleDaysMonth =
                numParents === 2 &&
                data.parent1Days > 0 &&
                (data.parent2Days ?? 0) > 0;
              const total = data.parent1Total + (data.parent2Total ?? 0);

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isDoubleDaysMonth
                      ? "bg-orange-50 border-orange-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-800">
                      {data.month}
                      {isDoubleDaysMonth && (
                        <span className="ml-2 text-xs font-semibold text-orange-600">
                          🟠
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      {total.toLocaleString("sv-SE")} kr
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{parent1Name}:</span>
                      <span className="font-medium">
                        {data.parent1Total.toLocaleString("sv-SE")} kr
                        {data.parent1Days > 0 && (
                          <span
                            className={`text-xs ml-1 ${
                              data.parent1LowDays && data.parent1LowDays > 0
                                ? "text-orange-700"
                                : "text-gray-500"
                            }`}
                          >
                            ({Math.round(data.parent1Days)} {t.daysLabel}
                            {data.parent1LowDays && data.parent1LowDays > 0 && (
                              <span className="text-orange-600">
                                {" "}
                                - ⚠️ {Math.round(data.parent1LowDays)}{" "}
                                {language === "sv" ? "lägst" : "min"}
                              </span>
                            )}
                            )
                          </span>
                        )}
                      </span>
                    </div>

                    {numParents === 2 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{parent2Name}:</span>
                        <span className="font-medium">
                          {data.parent2Total?.toLocaleString("sv-SE") ?? "0"} kr
                          {(data.parent2Days ?? 0) > 0 && (
                            <span
                              className={`text-xs ml-1 ${
                                data.parent2LowDays && data.parent2LowDays > 0
                                  ? "text-orange-700"
                                  : "text-gray-500"
                              }`}
                            >
                              ({Math.round(data.parent2Days ?? 0)} {t.daysLabel}
                              {data.parent2LowDays &&
                                data.parent2LowDays > 0 && (
                                  <span className="text-orange-600">
                                    {" "}
                                    - ⚠️ {Math.round(data.parent2LowDays)}{" "}
                                    {language === "sv" ? "lägst" : "min"}
                                  </span>
                                )}
                              )
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop view - Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t.monthLabel}</th>
                  <th className="text-right p-2">{parent1Name}</th>
                  {numParents === 2 && (
                    <th className="text-right p-2">{parent2Name}</th>
                  )}
                  <th className="text-right p-2">{t.totalLabel}</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => {
                  const isDoubleDaysMonth =
                    numParents === 2 &&
                    data.parent1Days > 0 &&
                    (data.parent2Days ?? 0) > 0;

                  return (
                    <tr
                      key={index}
                      className={`border-b transition-colors ${
                        isDoubleDaysMonth
                          ? "bg-orange-50 hover:bg-orange-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-2">
                        {data.month}
                        {isDoubleDaysMonth && (
                          <span className="ml-2 text-xs font-semibold text-orange-600">
                            🟠
                          </span>
                        )}
                      </td>
                      <td className="text-right p-2">
                        {data.parent1Total.toLocaleString("sv-SE")} kr
                        {data.parent1Days > 0 ? (
                          <span
                            className={`text-xs font-medium ml-1 ${
                              data.parent1LowDays && data.parent1LowDays > 0
                                ? "text-orange-700"
                                : "text-green-700"
                            }`}
                          >
                            👶 ({Math.round(data.parent1Days)} {t.daysLabel})
                            {data.parent1LowDays && data.parent1LowDays > 0 && (
                              <span className="block text-orange-600 text-xs">
                                ⚠️ {Math.round(data.parent1LowDays)}{" "}
                                {language === "sv"
                                  ? "lägstanivå"
                                  : "minimum level"}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 ml-1">💼</span>
                        )}
                      </td>
                      {numParents === 2 && (
                        <td className="text-right p-2">
                          {data.parent2Total?.toLocaleString("sv-SE") ?? "0"} kr
                          {(data.parent2Days ?? 0) > 0 ? (
                            <span
                              className={`text-xs font-medium ml-1 ${
                                data.parent2LowDays && data.parent2LowDays > 0
                                  ? "text-orange-700"
                                  : "text-green-700"
                              }`}
                            >
                              👶 ({Math.round(data.parent2Days ?? 0)}{" "}
                              {t.daysLabel})
                              {data.parent2LowDays &&
                                data.parent2LowDays > 0 && (
                                  <span className="block text-orange-600 text-xs">
                                    ⚠️ {Math.round(data.parent2LowDays)}{" "}
                                    {language === "sv"
                                      ? "lägstanivå"
                                      : "minimum level"}
                                  </span>
                                )}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 ml-1">
                              💼
                            </span>
                          )}
                        </td>
                      )}
                      <td className="text-right p-2 font-semibold">
                        {(
                          data.parent1Total + (data.parent2Total ?? 0)
                        ).toLocaleString("sv-SE")}{" "}
                        kr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyIncomeTable;
