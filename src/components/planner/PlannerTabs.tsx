import React, { useRef } from "react";

export interface PlannerTab<T extends string> {
  id: T;
  label: string;
}

interface PlannerTabsProps<T extends string> {
  label: string;
  tabs: PlannerTab<T>[];
  active: T;
  onChange: (id: T) => void;
  children: React.ReactNode;
}

/** Flikar enligt WAI-ARIA: piltangenter byter flik, panelen hör ihop med fliken. */
const PlannerTabs = <T extends string>({
  label,
  tabs,
  active,
  onChange,
  children,
}: PlannerTabsProps<T>) => {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1 mb-4"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              id={`planner-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`planner-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selected
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={`planner-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`planner-tab-${active}`}
      >
        {children}
      </div>
    </div>
  );
};

export default PlannerTabs;
