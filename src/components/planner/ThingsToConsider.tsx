import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { Issue, IssueCode } from "../../utils/calculations";

/** Varningar som mätarna och statusen för reserverade dagar redan visar */
const SHOWN_IN_METERS: IssueCode[] = [
  "totalDays",
  "levelHigh",
  "levelLow",
  "doubleDaysMax",
  "reservedLost",
];

/** "Att tänka på": varningar som inte syns i mätarna. */
const ThingsToConsider: React.FC<{ issues: Issue[] }> = ({ issues }) => {
  const { t } = useLanguage();
  const shown = issues.filter((issue) => !SHOWN_IN_METERS.includes(issue.code));
  const errors = shown.filter((issue) => issue.severity === "error");
  const info = shown.filter((issue) => issue.severity === "info");

  if (shown.length === 0) return null;

  return (
    <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5" aria-live="polite">
      <h2 className="text-lg font-semibold text-green-900">{t.tcHeading}</h2>
      {errors.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
          <h3 className="mb-1.5 text-sm font-semibold text-orange-900">{t.tcErrors}</h3>
          <ul className="grid list-disc gap-1.5 pl-5 text-sm text-orange-900">
            {errors.map((issue, i) => (
              <li key={i}>{issue.message.replace(/^⚠️\s*/, "")}</li>
            ))}
          </ul>
        </div>
      )}
      {info.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <h3 className="mb-1.5 text-sm font-semibold text-gray-800">{t.tcInfo}</h3>
          <ul className="grid list-disc gap-1.5 pl-5 text-sm text-gray-700">
            {info.map((issue, i) => (
              <li key={i}>{issue.message.replace(/^⚠️\s*/, "")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThingsToConsider;
