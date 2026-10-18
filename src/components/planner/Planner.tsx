import React, { useState } from "react";
import { Baby } from "lucide-react";
import { Plan } from "../../hooks/usePlan";
import { useLanguage } from "../../i18n/LanguageContext";
import LanguageSwitcher from "../LanguageSwitcher";
import FeedbackFooter from "../FeedbackFooter";
import Summary from "../Summary";
import ValidationWarnings from "../calculator/ValidationWarnings";
import PlannerLayout from "./PlannerLayout";
import PlannerTabs from "./PlannerTabs";
import { plannerUrl } from "./plannerFlag";
import QuickStart from "./QuickStart";
import { useQuickStart } from "./useQuickStart";

type PlannerTabId = "quick" | "detailed";

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5">{children}</div>
);

/** Den nya planeraren (docs/PLANERARE.md). Byggs steg för steg i Fas 3. */
const Planner: React.FC<{ plan: Plan }> = ({ plan }) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<PlannerTabId>("quick");
  const quickStart = useQuickStart(plan);

  const totalAfterTax = plan.parentResults.reduce((sum, r) => sum + r.totalBenefitAfterTax, 0);
  const totalBeforeTax = plan.parentResults.reduce((sum, r) => sum + r.totalBenefitBeforeTax, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-6 px-4">
      <header className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Baby className="text-green-700" size={36} />
          <div>
            <h1 className="text-2xl font-bold text-green-900">{t.appTitle}</h1>
            <p className="text-sm text-gray-600">
              {t.plannerNote} ·{" "}
              <a className="underline hover:text-gray-900" href={plannerUrl(false)}>
                {t.plannerBackToOld}
              </a>
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <PlannerLayout
        form={
          <PlannerTabs
            label={t.plannerTabsLabel}
            tabs={[
              { id: "quick", label: t.plannerTabQuick },
              { id: "detailed", label: t.plannerTabDetailed },
            ]}
            active={tab}
            onChange={setTab}
          >
            {tab === "quick" ? (
              <QuickStart
                plan={plan}
                quickStart={quickStart}
                onFineTune={() => setTab("detailed")}
              />
            ) : (
              <Panel>
                <p className="text-sm text-gray-600">{t.plannerComingSoon}</p>
              </Panel>
            )}
          </PlannerTabs>
        }
        visualization={
          <>
            <ValidationWarnings warnings={plan.validation.allWarnings} />
            <Panel>
              <h2 className="text-lg font-semibold text-green-900 mb-3">
                {t.plannerPlanHeading}
              </h2>
              <Summary
                parents={plan.parents}
                numParents={plan.numParents}
                parentResults={plan.parentResults}
                totalBenefitAfterTax={totalAfterTax}
                totalBenefitBeforeTax={totalBeforeTax}
              />
            </Panel>
          </>
        }
      />

      <FeedbackFooter />
    </div>
  );
};

export default Planner;
