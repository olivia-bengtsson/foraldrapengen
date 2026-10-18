import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate } from "../../i18n/translations";
import { ReservedDaysStatus as Status } from "../../utils/calculations";
import { PARENT_BLOCK } from "./timelineStyles";

/** Per förälder: antal dagar och om de reserverade dagarna används. */
const ReservedDaysStatus: React.FC<{ statuses: Status[] }> = ({ statuses }) => {
  const { t } = useLanguage();
  if (statuses.length === 0) return null;

  return (
    <ul className="mt-4 grid gap-1.5 text-sm" data-help="reserved">
      {statuses.map((status, i) => {
        const [text, pillClass] =
          status.exceeded > 0
            ? [interpolate(t.rsExceeded, { days: status.exceeded }), "bg-red-100 text-red-900"]
            : status.lost > 0
              ? [interpolate(t.rsLost, { days: status.lost }), "bg-amber-100 text-amber-900"]
              : [t.rsUsed, "bg-green-100 text-green-900"];
        return (
          <li key={status.parentId} className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${PARENT_BLOCK[i]}`} />
            <strong className="font-semibold text-gray-900">{status.name}</strong>
            <span className="tabular-nums text-gray-600">
              · {interpolate(t.rsDays, { days: status.ownDays })} ·
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pillClass}`}>
              {text}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default ReservedDaysStatus;
