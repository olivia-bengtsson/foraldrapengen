import React, { useState, useMemo, useEffect } from "react";
import { Baby } from "lucide-react";
import {
  Parent,
  ParentBenefits,
  MonthlyData,
  TabType,
  MonthlyIncomeResult,
} from "./types";
import {
  calculateParentBenefits,
  getMonthlyIncomeForParent,
  validateAllRules,
} from "./utils/calculations";
import { EXAMPLES, ExampleKey } from "./constants";
import { generatePeriodId } from "./utils/periodHelpers";
import Summary from "./components/Summary";
import MonthlyIncomeTable from "./components/MonthlyIncomeTable";
import ExamplesTab from "./components/ExamplesTab";
import InfoCarousel from "./components/InfoCarousel";
import InfoSidebar from "./components/InfoSidebar";
import ExportButtons from "./components/ExportButtons";
import LanguageSwitcher from "./components/LanguageSwitcher";
import OnboardingGuide from "./components/OnboardingGuide";
import FeedbackFooter from "./components/FeedbackFooter";
import CollapsibleSection from "./components/CollapsibleSection";

// NEW: Extracted components
import SettingsSection from "./components/calculator/SettingsSection";
import ParentsSection from "./components/calculator/ParentsSection";
import ValidationWarnings from "./components/calculator/ValidationWarnings";

import { useLanguage } from "./i18n/LanguageContext";

const ForaldrapengenCalculator = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("calculator");
  const [numParents, setNumParents] = useState<1 | 2>(2);

  // Set birth date to today's date by default
  const today = new Date().toISOString().split("T")[0];
  const [birthDate, setBirthDate] = useState<string>(today);

  const [selectedInfoCard, setSelectedInfoCard] = useState<string>("sgi");

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Municipality and tax settings
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(0.3); // 30% default
  const [isChurchMember, setIsChurchMember] = useState<boolean>(false);

  // Validation warnings
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Progressive flow state - which sections are open/completed
  const [openSections, setOpenSections] = useState({
    settings: true, // Settings (antal föräldrar, födelsedatum, kommun)
    parents: false, // Föräldrakort
    summary: false, // Sammanfattning
    table: false, // Månadstabell
  });

  // Helper functions for date calculations
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getDateAfterDays = (
    startDate: string,
    days: number,
    daysPerWeek: number,
  ) => {
    const start = new Date(startDate);
    const totalCalendarDays = Math.ceil((days * 7) / daysPerWeek);
    start.setDate(start.getDate() + totalCalendarDays);
    return start.toISOString().split("T")[0];
  };

  // Calculate initial dates
  const initialToday = getTodayDate();
  const initialEndDate1 = getDateAfterDays(initialToday, 240, 5);

  const startDate2Temp = new Date(initialEndDate1);
  startDate2Temp.setDate(startDate2Temp.getDate() + 1);
  const initialStartDate2 = startDate2Temp.toISOString().split("T")[0];
  const initialEndDate2 = getDateAfterDays(initialStartDate2, 240, 5);

  const [parents, setParents] = useState<Parent[]>([
    {
      id: 1,
      name: "Förälder 1",
      type: "employed",
      monthlySalary: 35000,
      employerTopUp: 10,
      employerTopUpDays: 360,
      periods: [
        {
          id: generatePeriodId(),
          daysToTake: 240,
          daysPerWeek: 5,
          startDate: initialToday,
          endDate: initialEndDate1,
        },
      ],
    },
    {
      id: 2,
      name: "Förälder 2",
      type: "employed",
      monthlySalary: 35000,
      employerTopUp: 10,
      employerTopUpDays: 360,
      periods: [
        {
          id: generatePeriodId(),
          daysToTake: 240,
          daysPerWeek: 5,
          startDate: initialStartDate2,
          endDate: initialEndDate2,
        },
      ],
    },
  ]);

  const handleMunicipalityChange = (
    municipality: string,
    newTaxRate: number,
  ) => {
    setSelectedMunicipality(municipality);
    setTaxRate(newTaxRate);
  };

  // Check if user should see onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    }
  }, []);

  // Validate parental leave rules
  useEffect(() => {
    const validation = validateAllRules(parents, numParents, birthDate);
    setValidationWarnings(validation.allWarnings);
  }, [parents, numParents, birthDate]);

  // Toggle functions for manual control
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Navigate to next section with smooth scroll
  const goToNextSection = (
    currentSection: keyof typeof openSections,
    nextSection: keyof typeof openSections,
  ) => {
    setOpenSections((prev) => ({
      ...prev,
      [currentSection]: false, // Close current section
      [nextSection]: true, // Open next section
    }));
  };

  // Beräkna resultat för alla föräldrar (nu med taxRate)
  const parentResults: ParentBenefits[] = useMemo(() => {
    return parents
      .slice(0, numParents)
      .map((parent) => calculateParentBenefits(parent, taxRate));
  }, [parents, numParents, taxRate]);

  // Beräkna totala dagar och återstående
  // Beräkna automatiskt dubbeldagar baserat på överlappande perioder
  const calculatedDoubleDays = useMemo(() => {
    if (numParents !== 2) return 0;

    const parent1Periods = parents[0].periods;
    const parent2Periods = parents[1].periods;

    let totalDoubleDays = 0;

    for (const p1 of parent1Periods) {
      const p1Start = new Date(p1.startDate);
      const p1End = new Date(p1.endDate);

      for (const p2 of parent2Periods) {
        const p2Start = new Date(p2.startDate);
        const p2End = new Date(p2.endDate);

        const overlapStart = new Date(
          Math.max(p1Start.getTime(), p2Start.getTime()),
        );
        const overlapEnd = new Date(Math.min(p1End.getTime(), p2End.getTime()));

        if (overlapStart <= overlapEnd) {
          const overlapDays =
            Math.ceil(
              (overlapEnd.getTime() - overlapStart.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;
          const minDaysPerWeek = Math.min(p1.daysPerWeek, p2.daysPerWeek);
          const effectiveDoubleDays = Math.ceil(
            (overlapDays * minDaysPerWeek) / 7,
          );
          totalDoubleDays += effectiveDoubleDays;
        }
      }
    }

    return totalDoubleDays;
  }, [parents, numParents]);

  // Beräkna månadsinkomst
  const monthlyData = useMemo((): MonthlyData[] => {
    const allDates = parents
      .slice(0, numParents)
      .flatMap((p) =>
        p.periods.map((period) => [
          new Date(period.startDate),
          new Date(period.endDate),
        ]),
      )
      .flat();

    if (allDates.length === 0) return [];

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    const months: MonthlyData[] = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (current <= maxDate) {
      const year = current.getFullYear();
      const month = current.getMonth();

      const parent1Result: MonthlyIncomeResult = getMonthlyIncomeForParent(
        parents[0],
        parentResults[0],
        year,
        month,
        taxRate,
      );

      const parent2Result: MonthlyIncomeResult | undefined =
        numParents === 2
          ? getMonthlyIncomeForParent(
              parents[1],
              parentResults[1],
              year,
              month,
              taxRate,
            )
          : undefined;

      months.push({
        month: `${year}-${String(month + 1).padStart(2, "0")}`,
        parent1Total: parent1Result.total,
        parent2Total: parent2Result?.total,
        parent1Days: parent1Result.days,
        parent2Days: parent2Result?.days,
        parent1HighDays: parent1Result.highDays,
        parent1LowDays: parent1Result.lowDays,
        parent2HighDays: parent2Result?.highDays,
        parent2LowDays: parent2Result?.lowDays,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }, [parents, numParents, taxRate, parentResults]);

  // Parent update handlers
  const updateParent = (id: number, field: string, value: any) => {
    setParents((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const updatePeriod = (
    parentId: number,
    periodId: string,
    field: string,
    value: any,
  ) => {
    setParents((prev) =>
      prev.map((parent) => {
        if (parent.id !== parentId) return parent;

        return {
          ...parent,
          periods: parent.periods.map((period) =>
            period.id === periodId ? { ...period, [field]: value } : period,
          ),
        };
      }),
    );
  };

  const addPeriod = (parentId: number) => {
    setParents((prev) =>
      prev.map((parent) => {
        if (parent.id !== parentId) return parent;

        const lastPeriod = parent.periods[parent.periods.length - 1];
        const lastEndDate = lastPeriod
          ? new Date(lastPeriod.endDate)
          : new Date();
        const newStartDateObj = new Date(lastEndDate);
        newStartDateObj.setDate(newStartDateObj.getDate() + 1);
        const newStartDate = newStartDateObj.toISOString().split("T")[0];
        const newEndDate = getDateAfterDays(newStartDate, 30, 5);

        const newPeriod = {
          id: generatePeriodId(),
          daysToTake: 30,
          daysPerWeek: 5,
          startDate: newStartDate,
          endDate: newEndDate,
        };

        return {
          ...parent,
          periods: [...parent.periods, newPeriod],
        };
      }),
    );
  };

  const deletePeriod = (parentId: number, periodId: string) => {
    setParents((prev) =>
      prev.map((parent) => {
        if (parent.id !== parentId) return parent;

        if (parent.periods.length === 1) {
          return parent;
        }

        return {
          ...parent,
          periods: parent.periods.filter((p) => p.id !== periodId),
        };
      }),
    );
  };

  // Load example
  const loadExample = (exampleKey: ExampleKey) => {
    const example = EXAMPLES[exampleKey];
    setNumParents(example.parents.length as 1 | 2);
    setParents(example.parents);
    setActiveTab("calculator");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      {/* Onboarding Guide */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Baby className="text-green-700" size={40} />
            <div>
              <h1 className="text-3xl font-bold text-green-900">
                {t.appTitle}
              </h1>
              <p className="text-sm text-gray-600">{t.appSubtitle}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Info Carousel - Always visible on mobile and tablet */}
        <div className="lg:hidden mb-6">
          <InfoCarousel
            selectedCard={selectedInfoCard}
            onSelectCard={setSelectedInfoCard}
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "calculator"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.calculatorTab}
          </button>
          <button
            onClick={() => setActiveTab("examples")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "examples"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.examplesTab}
          </button>
        </div>

        {/* Main content area with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="lg:col-span-8">
            {activeTab === "examples" ? (
              <ExamplesTab onLoadExample={loadExample} />
            ) : (
              <div className="space-y-6">
                {/* Section 1: Settings */}
                <CollapsibleSection
                  title={
                    language === "sv"
                      ? "1. Grundinställningar"
                      : "1. Basic Settings"
                  }
                  subtitle={
                    language === "sv"
                      ? "Välj kommun, datum och antal föräldrar"
                      : "Select municipality, date and number of parents"
                  }
                  isOpen={openSections.settings}
                  isComplete={selectedMunicipality !== "" && birthDate !== ""}
                  onToggle={() => toggleSection("settings")}
                  autoScroll={false}
                  showNextButton={true}
                  onNext={() => goToNextSection("settings", "parents")}
                  nextButtonText={
                    language === "sv"
                      ? "Nästa: Föräldrakort →"
                      : "Next: Parent Cards →"
                  }
                >
                  <SettingsSection
                    numParents={numParents}
                    setNumParents={setNumParents}
                    birthDate={birthDate}
                    setBirthDate={setBirthDate}
                    selectedMunicipality={selectedMunicipality}
                    onMunicipalityChange={handleMunicipalityChange}
                    isChurchMember={isChurchMember}
                    onChurchMemberChange={setIsChurchMember}
                    calculatedDoubleDays={calculatedDoubleDays}
                  />
                </CollapsibleSection>

                {/* Section 2: Parents */}
                <CollapsibleSection
                  title={
                    language === "sv" ? "2. Föräldrakort" : "2. Parent Cards"
                  }
                  subtitle={
                    language === "sv"
                      ? "Fyll i löner, perioder och planera er ledighet"
                      : "Fill in salaries, periods and plan your leave"
                  }
                  isOpen={openSections.parents}
                  isComplete={parents
                    .slice(0, numParents)
                    .every(
                      (p) =>
                        p.monthlySalary > 0 &&
                        p.periods.length > 0 &&
                        p.periods.every((period) => period.daysToTake > 0),
                    )}
                  onToggle={() => toggleSection("parents")}
                  autoScroll={true}
                  showNextButton={true}
                  onNext={() => goToNextSection("parents", "summary")}
                  nextButtonText={
                    language === "sv"
                      ? "Nästa: Se sammanfattning →"
                      : "Next: View summary →"
                  }
                >
                  <ParentsSection
                    parents={parents}
                    numParents={numParents}
                    parentResults={parentResults}
                    calculatedDoubleDays={calculatedDoubleDays}
                    onUpdateParent={updateParent}
                    onUpdatePeriod={updatePeriod}
                    onAddPeriod={addPeriod}
                    onDeletePeriod={deletePeriod}
                  />
                </CollapsibleSection>

                {/* Section 3: Summary */}
                <CollapsibleSection
                  title={language === "sv" ? "3. Sammanfattning" : "3. Summary"}
                  subtitle={
                    language === "sv"
                      ? "Total ekonomisk översikt"
                      : "Total financial overview"
                  }
                  isOpen={openSections.summary}
                  isComplete={true}
                  onToggle={() => toggleSection("summary")}
                  autoScroll={true}
                  showNextButton={true}
                  onNext={() => goToNextSection("summary", "table")}
                  nextButtonText={
                    language === "sv"
                      ? "Nästa: Se månadstabell →"
                      : "Next: View monthly table →"
                  }
                >
                  <div className="space-y-4">
                    <ValidationWarnings warnings={validationWarnings} />
                    <Summary
                      parents={parents}
                      numParents={numParents}
                      parentResults={parentResults}
                      totalBenefitAfterTax={parentResults
                        .slice(0, numParents)
                        .reduce((sum, p) => sum + p.totalBenefitAfterTax, 0)}
                      totalBenefitBeforeTax={parentResults
                        .slice(0, numParents)
                        .reduce((sum, p) => sum + p.totalBenefitBeforeTax, 0)}
                    />
                  </div>
                </CollapsibleSection>

                {/* Section 4: Monthly Table */}
                <CollapsibleSection
                  title={
                    language === "sv" ? "4. Månadsinkomst" : "4. Monthly Income"
                  }
                  subtitle={
                    language === "sv"
                      ? "Detaljerad inkomst månad för månad"
                      : "Detailed income month by month"
                  }
                  isOpen={openSections.table}
                  isComplete={true}
                  onToggle={() => toggleSection("table")}
                  autoScroll={true}
                >
                  <MonthlyIncomeTable
                    monthlyData={monthlyData}
                    numParents={numParents}
                    doubleDays={calculatedDoubleDays}
                    parent1Name={parents[0]?.name}
                    parent2Name={parents[1]?.name}
                  />
                </CollapsibleSection>

                {/* Export Buttons */}
                <ExportButtons
                  parents={parents}
                  numParents={numParents}
                  monthlyData={monthlyData}
                  parentResults={parentResults}
                  birthDate={birthDate}
                  doubleDays={calculatedDoubleDays}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Hidden on mobile/tablet, visible on desktop */}
          <div className="hidden lg:block lg:col-span-4">
            <InfoSidebar
              selectedCard={selectedInfoCard}
              onSelectCard={setSelectedInfoCard}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <FeedbackFooter />
    </div>
  );
};

export default ForaldrapengenCalculator;
