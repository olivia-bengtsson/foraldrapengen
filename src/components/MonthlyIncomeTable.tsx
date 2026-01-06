import React from "react";
import { TrendingUp } from "lucide-react";
import { MonthlyData } from "../types";
import { useLanguage } from "../i18n/LanguageContext";

interface MonthlyIncomeTableProps {
  monthlyData: MonthlyData[];
  numParents: 1 | 2;
  doubleDays: number;
}

const MonthlyIncomeTable: React.FC<MonthlyIncomeTableProps> = ({
  monthlyData,
  numParents,
  doubleDays,
}) => {
  const { t, language } = useLanguage();

  // Check if any month has double days (both parents have days)
  const hasDoubleDays =
    numParents === 2 &&
    monthlyData.some((data) => data.parent1Days > 0 && data.parent2Days > 0);

  // Check if exceeding 60 double days limit
  const exceedsLimit = doubleDays > 60;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        {t.monthlyIncomeTitle}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{t.monthlyIncomeSubtitle}</p>

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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">{t.monthLabel}</th>
              <th className="text-right p-2">{t.parent1Label}</th>
              {numParents === 2 && (
                <th className="text-right p-2">{t.parent2Label}</th>
              )}
              <th className="text-right p-2">{t.totalLabel}</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((data, index) => {
              const isDoubleDaysMonth =
                numParents === 2 &&
                data.parent1Days > 0 &&
                data.parent2Days > 0;

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
                    {data.parent1Days > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round(data.parent1Days)} {t.daysLabel})
                      </span>
                    )}
                  </td>
                  {numParents === 2 && (
                    <td className="text-right p-2">
                      {data.parent2Total.toLocaleString("sv-SE")} kr
                      {data.parent2Days > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({Math.round(data.parent2Days)} {t.daysLabel})
                        </span>
                      )}
                    </td>
                  )}
                  <td className="text-right p-2 font-semibold">
                    {(data.parent1Total + data.parent2Total).toLocaleString(
                      "sv-SE"
                    )}{" "}
                    kr
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyIncomeTable;
