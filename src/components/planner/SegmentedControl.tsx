import React from "react";

export interface SegmentOption<T> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T> {
  /** id på elementet som beskriver gruppen (aria-labelledby) */
  labelledBy: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Knappgrupp där en knapp är vald (aria-pressed). */
const SegmentedControl = <T extends string | number>({
  labelledBy,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => (
  <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(option.value)}
          className={`min-w-[44px] px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            selected
              ? "bg-green-600 border-green-600 text-white font-semibold"
              : "bg-white border-gray-300 text-gray-700 hover:border-green-600"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
