import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

interface PlannerLayoutProps {
  form: React.ReactNode;
  visualization: React.ReactNode;
}

/**
 * Två kolumner från 920 px: formulär till vänster, visualisering till höger (sticky).
 * På mobil en kolumn med visualiseringen först.
 */
const PlannerLayout: React.FC<PlannerLayoutProps> = ({ form, visualization }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 gap-7 items-start planner:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section aria-label={t.plannerFormLabel} className="min-w-0">
        {form}
      </section>
      <aside
        aria-label={t.plannerPlanLabel}
        className="order-first min-w-0 grid gap-4 planner:order-none planner:sticky planner:top-3 planner:max-h-[calc(100vh-1.5rem)] planner:overflow-auto"
      >
        {visualization}
      </aside>
    </div>
  );
};

export default PlannerLayout;
