import React from "react";
import { Plan } from "../../hooks/usePlan";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate } from "../../i18n/translations";
import { RULES } from "../../rules";
import { reservedDaysStatus } from "../../utils/calculations";
import { daysMeters } from "../../utils/daysMeters";
import Meter from "./Meter";
import ReservedDaysStatus from "./ReservedDaysStatus";
import { DOUBLE_DAYS, PARENT_BLOCK } from "./timelineStyles";

/** "Dagar kvar att planera": sjukpenningnivå, lägstanivå, dubbeldagar och reserverade dagar. */
const DaysMeters: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { t } = useLanguage();
  const meters = daysMeters(plan.parents, plan.numParents, plan.birthDate);
  const double = meters.double;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-green-900">{t.mtHeading}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Meter label={t.mtHigh} data={meters.high} segmentClasses={PARENT_BLOCK} sub={t.mtHighSub} />
        <Meter
          label={t.mtLow}
          data={meters.low}
          segmentClasses={PARENT_BLOCK}
          sub={interpolate(t.mtLowSub, { amount: RULES.benefit.lowLevelDaily })}
        />
        {double && (
          <Meter
            label={t.mtDouble}
            data={double}
            segmentClasses={[DOUBLE_DAYS]}
            sub={
              double.late > 0 ? (
                <span className="font-semibold text-red-700">
                  {interpolate(t.mtDoubleLate, { days: double.late })}
                </span>
              ) : (
                t.mtDoubleSub
              )
            }
          />
        )}
      </div>
      <ReservedDaysStatus statuses={reservedDaysStatus(plan.parents, plan.numParents)} />
    </div>
  );
};

export default DaysMeters;
