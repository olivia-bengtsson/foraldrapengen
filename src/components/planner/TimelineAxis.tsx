import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { locales } from "../../i18n/translations";
import { formatMonth, toDayNumber } from "../../utils/dates";
import { axisTicks, TimelineRange, toPercent } from "../../utils/timeline";

/** Månadsetiketter under tidslinjen. Antalet anpassas efter bredden. */
const TimelineAxis: React.FC<{ range: TimelineRange }> = ({ range }) => {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const ticks = axisTicks(range, width);

  return (
    <div ref={ref} aria-hidden="true" className="relative h-5 text-xs text-gray-500">
      {ticks.map((tick, i) => {
        // Årtal vid årsskifte
        const withYear = i > 0 && tick.date.slice(0, 4) !== ticks[i - 1].date.slice(0, 4);
        return (
          <span
            key={tick.date}
            className={`absolute whitespace-nowrap ${i === 0 ? "" : "-translate-x-1/2"}`}
            style={{ left: `${toPercent(toDayNumber(tick.date), range)}%` }}
          >
            {i === 0 ? t.tlBirth : formatMonth(tick.date, locales[language], withYear)}
          </span>
        );
      })}
    </div>
  );
};

export default TimelineAxis;
