import React from "react";
import { Plan } from "../../hooks/usePlan";
import { useLanguage } from "../../i18n/LanguageContext";
import ParentPlanCard from "./ParentPlanCard";

const DetailedPlan: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { t } = useLanguage();
  const active: Array<0 | 1> = plan.numParents === 2 ? [0, 1] : [0];

  return (
    <div className="grid gap-4">
      <div className="grid gap-2 rounded-xl border border-gray-200 bg-white p-4" data-help="birth">
        <label htmlFor="dp-birth" className="font-semibold text-gray-800">
          {t.birthDateLabel}
        </label>
        <input
          id="dp-birth"
          type="date"
          value={plan.birthDate}
          onChange={(e) => e.target.value && plan.setBirthDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      {active.map((i) => (
        <ParentPlanCard key={plan.parents[i].id} plan={plan} index={i} />
      ))}
    </div>
  );
};

export default DetailedPlan;
