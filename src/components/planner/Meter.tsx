import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate } from "../../i18n/translations";
import { MeterData } from "../../utils/daysMeters";

interface MeterProps {
  label: string;
  data: MeterData;
  /** Färg per förälder (segment i stapeln) */
  segmentClasses: string[];
  /** Undertext när taket inte överskrids */
  sub: React.ReactNode;
}

/** "200 kvar av 390" med en stapel per förälder. Röd när taket överskrids. */
const Meter: React.FC<MeterProps> = ({ label, data, segmentClasses, sub }) => {
  const { t } = useLanguage();
  const over = data.over > 0;

  return (
    <div className="grid content-start gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${over ? "text-red-700" : "text-gray-900"}`}>
        {data.remaining}{" "}
        <small className="text-sm font-medium text-gray-500">
          {interpolate(t.mtOf, { max: data.max })}
        </small>
      </span>
      <div
        role="meter"
        aria-label={interpolate(t.mtAria, { label, used: data.used, max: data.max })}
        aria-valuemin={0}
        aria-valuemax={data.max}
        aria-valuenow={Math.min(data.used, data.max)}
        className="flex h-2 overflow-hidden rounded-full bg-gray-100"
      >
        {over ? (
          <span className="h-full w-full bg-red-600" />
        ) : (
          data.perParent.map((days, i) => (
            <span
              key={i}
              className={`h-full ${segmentClasses[i]}`}
              style={{ width: `${(days / data.max) * 100}%` }}
            />
          ))
        )}
      </div>
      <span className={`text-xs ${over ? "font-semibold text-red-700" : "text-gray-500"}`}>
        {over ? interpolate(t.mtOver, { days: data.over }) : sub}
      </span>
    </div>
  );
};

export default Meter;
