import React from "react";
import { Plan } from "../../hooks/usePlan";
import { useLanguage } from "../../i18n/LanguageContext";
import { interpolate, locales } from "../../i18n/translations";
import { formatDate } from "../../utils/dates";
import { getOverlaps, periodEnd } from "../../utils/periodHelpers";
import {
  coverageSegments,
  doubleDaySegments,
  segmentDays,
  spanPercent,
  timelineMarkers,
  timelineRange,
} from "../../utils/timeline";
import { HIGHLIGHT_RING, useHighlight } from "./HighlightContext";
import TimelineAxis from "./TimelineAxis";
import TimelineRow from "./TimelineRow";
import {
  COVERAGE,
  DOUBLE_DAYS,
  DOUBLE_DAYS_LATE,
  MARKER_FIFTEEN,
  MARKER_ONE_YEAR,
  PARENT_BLOCK,
  PARENT_BLOCK_LOW,
  PART_TIME,
} from "./timelineStyles";

interface PlanTimelineProps {
  plan: Plan;
  onSelectPeriod: (periodId: string) => void;
}

const Swatch: React.FC<{ className: string; label: string }> = ({ className, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <i aria-hidden="true" className={`inline-block h-2.5 w-5 rounded-sm ${className}`} />
    {label}
  </span>
);

const PlanTimeline: React.FC<PlanTimelineProps> = ({ plan, onSelectPeriod }) => {
  const { t, language } = useLanguage();
  const { highlighted, setHighlighted } = useHighlight();
  const locale = locales[language];
  const date = (d: string) => formatDate(d, locale);

  const two = plan.numParents === 2;
  const active = plan.parents.slice(0, plan.numParents);
  const allPeriods = active.flatMap((p) => p.periods);
  const range = timelineRange(plan.birthDate, allPeriods);
  const markers = timelineMarkers(plan.birthDate);
  const rowMarkers = { oneYear: markers.oneYear, fifteenMonths: two ? markers.fifteenMonths : undefined };

  const doubles = two
    ? doubleDaySegments(getOverlaps(active[0].periods, active[1].periods), markers.fifteenMonths)
    : [];
  const coverage = coverageSegments(allPeriods, plan.birthDate);
  const gaps = coverage.filter((s) => s.coverage === "gap");
  const partial = coverage.filter((s) => s.coverage === "partial");
  const partialWeeks = Math.round(partial.reduce((sum, s) => sum + segmentDays(s), 0) / 7);

  const place = (start: string, end: string) => {
    const { left, width } = spanPercent(start, end, range);
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-green-900">{t.tlHeading}</h2>

      {allPeriods.length === 0 ? (
        <p className="text-sm text-gray-500">{t.tlNoPeriods}</p>
      ) : (
        <>
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
            {active.map((parent, i) => (
              <TimelineRow
                key={parent.id}
                range={range}
                markers={rowMarkers}
                label={
                  <>
                    <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${PARENT_BLOCK[i]}`} />
                    <span className="truncate">{parent.name}</span>
                  </>
                }
              >
                {parent.periods.map((period) => {
                  const level = period.level === "high" ? t.tlLevelHigh : t.tlLevelLow;
                  const label = interpolate(t.tlBlockLabel, {
                    name: parent.name,
                    start: date(period.start),
                    end: date(periodEnd(period)),
                    days: period.daysPerWeek,
                    level,
                  });
                  return (
                    <button
                      key={period.id}
                      type="button"
                      aria-label={label}
                      title={label}
                      onClick={() => onSelectPeriod(period.id)}
                      onMouseEnter={() => setHighlighted(period.id)}
                      onMouseLeave={() => setHighlighted(null)}
                      onFocus={() => setHighlighted(period.id)}
                      className={`absolute inset-y-0 overflow-hidden whitespace-nowrap rounded px-1.5 text-left text-[11px] font-semibold ${
                        period.level === "low" ? `${PARENT_BLOCK_LOW[i]} text-gray-900` : `${PARENT_BLOCK[i]} text-white`
                      } ${period.daysPerWeek < 5 ? PART_TIME : ""} ${
                        highlighted === period.id ? `z-10 ${HIGHLIGHT_RING}` : ""
                      }`}
                      style={place(period.start, periodEnd(period))}
                    >
                      {interpolate(t.tlBlockDays, { days: period.daysPerWeek })}
                    </button>
                  );
                })}
              </TimelineRow>
            ))}

            {two && (
              <TimelineRow label={t.tlTogether} range={range} markers={rowMarkers} slim muted>
                {doubles.map((segment) => (
                  <div
                    key={segment.start}
                    title={interpolate(segment.late ? t.tlDoubleLateTitle : t.tlDoubleTitle, {
                      days: segment.days,
                      start: date(segment.start),
                      end: date(segment.end),
                    })}
                    className={`absolute inset-y-0 rounded-sm ${segment.late ? DOUBLE_DAYS_LATE : DOUBLE_DAYS}`}
                    style={place(segment.start, segment.end)}
                  />
                ))}
              </TimelineRow>
            )}

            <TimelineRow label={t.tlCoverage} range={range} markers={rowMarkers} slim muted>
              {coverage.map((segment) => (
                <div
                  key={segment.start}
                  title={
                    segment.coverage === "full"
                      ? undefined
                      : interpolate(segment.coverage === "gap" ? t.tlGapTitle : t.tlPartialTitle, {
                          start: date(segment.start),
                          end: date(segment.end),
                        })
                  }
                  className={`absolute inset-y-0 rounded-sm ${COVERAGE[segment.coverage]}`}
                  style={place(segment.start, segment.end)}
                />
              ))}
            </TimelineRow>

            <div />
            <TimelineAxis range={range} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600">
            <Swatch className={PARENT_BLOCK[0]} label={t.tlLegendHigh} />
            <Swatch className={PARENT_BLOCK_LOW[0]} label={t.tlLegendLow} />
            <Swatch className={`${PARENT_BLOCK[0]} ${PART_TIME}`} label={t.tlLegendPart} />
            {two && <Swatch className={DOUBLE_DAYS} label={t.tlLegendDouble} />}
            {two && <Swatch className={DOUBLE_DAYS_LATE} label={t.tlLegendDoubleLate} />}
            <Swatch className={COVERAGE.partial} label={t.tlLegendPartial} />
            <Swatch className={COVERAGE.gap} label={t.tlLegendGap} />
            <Swatch className={`h-3 w-0 rounded-none border-l-2 border-dotted ${MARKER_ONE_YEAR}`} label={t.tlLegendOneYear} />
            {two && (
              <Swatch className={`h-3 w-0 rounded-none border-l-2 border-dotted ${MARKER_FIFTEEN}`} label={t.tlLegendFifteen} />
            )}
          </div>

          {(gaps.length > 0 || partial.length > 0) && (
            <div className="mt-3 grid gap-1 text-sm text-gray-700">
              {gaps.length > 0 && (
                <p>
                  {gaps.length === 1
                    ? interpolate(t.tlGapOne, { date: date(gaps[0].start) })
                    : interpolate(t.tlGapMany, { count: gaps.length, date: date(gaps[0].start) })}
                </p>
              )}
              {partial.length > 0 && (
                <p>
                  {interpolate(t.tlPartialSummary, {
                    weeks: Math.max(1, partialWeeks),
                    date: date(partial[0].start),
                  })}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlanTimeline;
