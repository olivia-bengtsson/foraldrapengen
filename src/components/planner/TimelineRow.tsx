import React from "react";
import { TimelineRange, toPercent } from "../../utils/timeline";
import { toDayNumber } from "../../utils/dates";
import { MARKER_FIFTEEN, MARKER_ONE_YEAR } from "./timelineStyles";

interface TimelineRowProps {
  label: React.ReactNode;
  range: TimelineRange;
  markers: { oneYear: string; fifteenMonths?: string };
  slim?: boolean;
  muted?: boolean;
  children: React.ReactNode;
}

/** En rad i tidslinjen: etikett och ett spår där blocken placeras i procent. */
const TimelineRow: React.FC<TimelineRowProps> = ({
  label,
  range,
  markers,
  slim = false,
  muted = false,
  children,
}) => (
  <>
    <div
      className={`flex items-center gap-1.5 min-w-0 truncate text-sm ${
        muted ? "font-medium text-gray-500" : "font-semibold text-gray-800"
      }`}
    >
      {label}
    </div>
    <div className={`relative rounded-md bg-gray-100 ${slim ? "h-4" : "h-8"}`}>
      {children}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-1 -bottom-1 border-l-2 border-dotted ${MARKER_ONE_YEAR}`}
        style={{ left: `${toPercent(toDayNumber(markers.oneYear), range)}%` }}
      />
      {markers.fifteenMonths && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-1 -bottom-1 border-l-2 border-dotted ${MARKER_FIFTEEN}`}
          style={{ left: `${toPercent(toDayNumber(markers.fifteenMonths), range)}%` }}
        />
      )}
    </div>
  </>
);

export default TimelineRow;
