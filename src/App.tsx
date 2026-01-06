import React, { useState, useMemo, useEffect } from "react";
import { Baby, Calendar } from "lucide-react";
import { Parent, ParentBenefits, MonthlyData, TabType } from "./types";
import {
  calculateParentBenefits,
  getMonthlyIncomeForParent,
} from "./utils/calculations";
import { EXAMPLES, TOTAL_PARENTAL_DAYS, ExampleKey } from "./constants";
import ParentCard from "./components/ParentCard";
import MonthlyIncomeTable from "./components/MonthlyIncomeTable";
import Summary from "./components/Summary";
import ExamplesTab from "./components/ExamplesTab";
import InfoTooltip from "./components/InfoTooltip";
import InfoCarousel from "./components/InfoCarousel";
import InfoSidebar from "./components/InfoSidebar";
import ExportButtons from "./components/ExportButtons";
import LanguageSwitcher from "./components/LanguageSwitcher";
import MunicipalitySelector from "./components/MunicipalitySelector";
import OnboardingGuide from "./components/OnboardingGuide";
import FeedbackFooter from "./components/FeedbackFooter";
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

  // Helper functions for date calculations
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getDateAfterDays = (
    startDate: string,
    days: number,
    daysPerWeek: number
  ) => {
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return getTodayDate(); // Fallback to today if invalid
      }
      const totalDays = Math.ceil((days * 7) / daysPerWeek);
      start.setDate(start.getDate() + totalDays);
      return start.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error calculating date:", error);
      return getTodayDate();
    }
  };

  // Calculate initial dates once
  const initialToday = getTodayDate();
  const initialEndDate1 = getDateAfterDays(initialToday, 240, 5);
  const initialStartDate2Date = new Date(initialEndDate1);
  initialStartDate2Date.setDate(initialStartDate2Date.getDate() + 1);
  const initialStartDate2 = initialStartDate2Date.toISOString().split("T")[0];
  const initialEndDate2 = getDateAfterDays(initialStartDate2, 240, 5);

  const [parents, setParents] = useState<Parent[]>([
    {
      id: 1,
      name: "Förälder 1",
      type: "employed",
      monthlySalary: 35000,
      employerTopUp: 10,
      daysToTake: 240,
      daysPerWeek: 5,
      startDate: initialToday,
      endDate: initialEndDate1,
    },
    {
      id: 2,
      name: "Förälder 2",
      type: "employed",
      monthlySalary: 35000,
      employerTopUp: 10,
      daysToTake: 240,
      daysPerWeek: 5,
      startDate: initialStartDate2,
      endDate: initialEndDate2,
    },
  ]);

  const handleMunicipalityChange = (
    municipality: string,
    newTaxRate: number
  ) => {
    setSelectedMunicipality(municipality);
    setTaxRate(newTaxRate);
  };

  // Check if user should see onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay for better UX
      setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
    }
  }, []);

  // Beräkna resultat för alla föräldrar (nu med taxRate)
  const parentResults: ParentBenefits[] = useMemo(() => {
    return parents
      .slice(0, numParents)
      .map((parent) => calculateParentBenefits(parent, taxRate));
  }, [parents, numParents, taxRate]);

  // Beräkna totala dagar och återstående
  const totalDaysTaken = useMemo(() => {
    return parents
      .slice(0, numParents)
      .reduce((sum, p) => sum + p.daysToTake, 0);
  }, [parents, numParents]);

  // Beräkna automatiskt dubbeldagar baserat på överlappande perioder
  const calculatedDoubleDays = useMemo(() => {
    if (numParents !== 2) return 0;

    const parent1 = parents[0];
    const parent2 = parents[1];

    // Parse dates
    const start1 = new Date(parent1.startDate);
    const end1 = new Date(parent1.endDate);
    const start2 = new Date(parent2.startDate);
    const end2 = new Date(parent2.endDate);

    // Check if periods overlap
    const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
    const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));

    // If no overlap, return 0
    if (overlapStart > overlapEnd) return 0;

    // Calculate overlapping days
    // We need to count calendar days where BOTH parents are taking leave
    let overlapDays = 0;
    const current = new Date(overlapStart);

    while (current <= overlapEnd) {
      // Check if this day falls within both parents' leave periods
      // considering their daysPerWeek
      const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday

      // Simplified: assume they take weekdays if daysPerWeek < 7
      const parent1TakesThisDay =
        parent1.daysPerWeek === 7 || (dayOfWeek >= 1 && dayOfWeek <= 5);
      const parent2TakesThisDay =
        parent2.daysPerWeek === 7 || (dayOfWeek >= 1 && dayOfWeek <= 5);

      if (parent1TakesThisDay && parent2TakesThisDay) {
        overlapDays++;
      }

      current.setDate(current.getDate() + 1);
    }

    // Adjust based on actual days per week
    const adjustmentFactor =
      Math.min(parent1.daysPerWeek, parent2.daysPerWeek) / 7;
    return Math.round(overlapDays * adjustmentFactor);
  }, [parents, numParents]);

  const daysRemaining =
    TOTAL_PARENTAL_DAYS - totalDaysTaken - calculatedDoubleDays;

  // Beräkna totala ersättningar
  const { totalBenefitBeforeTax, totalBenefitAfterTax } = useMemo(() => {
    const beforeTax = parentResults.reduce(
      (sum, r) => sum + r.totalBenefitBeforeTax,
      0
    );
    const afterTax = parentResults.reduce(
      (sum, r) => sum + r.totalBenefitAfterTax,
      0
    );
    return { totalBenefitBeforeTax: beforeTax, totalBenefitAfterTax: afterTax };
  }, [parentResults]);

  // Beräkna månadsinkomst
  const getMonthlyData = useMemo((): MonthlyData[] => {
    const allDates = parents
      .slice(0, numParents)
      .flatMap((p) => [new Date(p.startDate), new Date(p.endDate)]);

    if (allDates.length === 0) return [];

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    const monthlyData: MonthlyData[] = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (current <= maxDate) {
      const year = current.getFullYear();
      const month = current.getMonth();

      const parent1Data = getMonthlyIncomeForParent(
        parents[0],
        parentResults[0],
        year,
        month
      );

      let parent2Data = { total: 0, days: 0 };
      if (numParents === 2 && parentResults[1]) {
        parent2Data = getMonthlyIncomeForParent(
          parents[1],
          parentResults[1],
          year,
          month
        );
      }

      monthlyData.push({
        month: `${year}-${String(month + 1).padStart(2, "0")}`,
        parent1Total: parent1Data.total,
        parent1Days: parent1Data.days,
        parent2Total: parent2Data.total,
        parent2Days: parent2Data.days,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return monthlyData;
  }, [parents, parentResults, numParents]);

  // Uppdatera förälder
  const updateParent = (id: number, field: keyof Parent, value: any) => {
    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          let validatedValue = value;

          // Validate daysToTake - cannot exceed 480
          if (field === "daysToTake") {
            validatedValue = Math.max(0, Math.min(480, Number(value) || 0));
          }

          // Validate daysPerWeek - must be between 1 and 7
          if (field === "daysPerWeek") {
            validatedValue = Math.max(1, Math.min(7, Number(value) || 5));
          }

          const updated = { ...p, [field]: validatedValue };

          // Auto-beräkna slutdatum baserat på start, dagar och dagar/vecka
          if (
            field === "startDate" ||
            field === "daysToTake" ||
            field === "daysPerWeek"
          ) {
            try {
              const start = new Date(updated.startDate);
              if (
                !isNaN(start.getTime()) &&
                updated.daysToTake > 0 &&
                updated.daysPerWeek > 0
              ) {
                const weeksNeeded = Math.ceil(
                  updated.daysToTake / updated.daysPerWeek
                );
                start.setDate(start.getDate() + weeksNeeded * 7);
                updated.endDate = start.toISOString().split("T")[0];
              }
            } catch (error) {
              console.error("Error calculating end date:", error);
              // Keep existing endDate if calculation fails
            }
          }

          return updated;
        }
        return p;
      })
    );
  };

  // Ladda exempel
  const loadExample = (exampleKey: ExampleKey) => {
    const example = EXAMPLES[exampleKey];
    setNumParents(example.parents.length as 1 | 2);
    setParents(example.parents);
    // doubleDays is now auto-calculated from overlapping periods
    setActiveTab("calculator");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Onboarding Guide */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Language Switcher and Guide Button */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowOnboarding(true)}
            className="group px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium transition-all border-2 border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Baby
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            {language === "sv" ? "Visa guide" : "Show guide"}
          </button>
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <Baby className="text-indigo-600" size={48} />
            <h1 className="text-4xl font-bold text-gray-800">{t.appTitle}</h1>
          </div>
          <p className="text-gray-600 text-lg">{t.appSubtitle}</p>
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
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t.calculatorTab}
          </button>
          <button
            onClick={() => setActiveTab("examples")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "examples"
                ? "bg-indigo-600 text-white shadow-lg"
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
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
              {activeTab === "examples" ? (
                <ExamplesTab onLoadExample={loadExample} />
              ) : (
                <>
                  {/* Settings */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar size={24} />
                      {t.settingsTitle}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t.numParentsLabel}
                          </label>
                          <InfoTooltip
                            title={t.numParentsTooltipTitle}
                            content={t.numParentsTooltipContent}
                            link="https://www.forsakringskassan.se/foralder/foraldrapenning"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setNumParents(1)}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                              numParents === 1
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            1
                          </button>
                          <button
                            onClick={() => setNumParents(2)}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                              numParents === 2
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            2
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {t.birthDateLabel}
                          </label>
                          <InfoTooltip
                            title={t.birthDateTooltipTitle}
                            content={t.birthDateTooltipContent}
                            link="https://www.forsakringskassan.se/foralder/foraldrapenning"
                          />
                        </div>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                        />
                      </div>

                      {numParents === 2 && calculatedDoubleDays > 0 && (
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            calculatedDoubleDays > 60
                              ? "bg-red-50 border-red-500"
                              : "bg-blue-50 border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-lg font-semibold ${
                                calculatedDoubleDays > 60
                                  ? "text-red-700"
                                  : "text-blue-700"
                              }`}
                            >
                              {calculatedDoubleDays > 60 ? "⚠️" : "ℹ️"}{" "}
                              {language === "sv"
                                ? "Dubbeldagar"
                                : "Double days"}
                            </span>
                            <InfoTooltip
                              title={t.doubleDaysTooltipTitle}
                              content={t.doubleDaysTooltipContent}
                              link="https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning/foraldralediga-tillsammans---dubbeldagar"
                            />
                          </div>
                          <p
                            className={`text-sm ${
                              calculatedDoubleDays > 60
                                ? "text-red-700"
                                : "text-gray-700"
                            }`}
                          >
                            {language === "sv"
                              ? `Era perioder överlappar med ${calculatedDoubleDays} dagar. Detta använder ${calculatedDoubleDays * 2} dagar från era 480 dagar.`
                              : `Your periods overlap by ${calculatedDoubleDays} days. This uses ${calculatedDoubleDays * 2} days from your 480 days.`}
                          </p>
                          {calculatedDoubleDays > 60 && (
                            <p className="text-sm text-red-700 mt-2 font-semibold">
                              {language === "sv"
                                ? "⚠️ Max 60 dubbeldagar tillåts! Justera era start/slutdatum för att minska överlappningen."
                                : "⚠️ Max 60 double days allowed! Adjust your start/end dates to reduce overlap."}
                            </p>
                          )}
                          {calculatedDoubleDays > 0 &&
                            calculatedDoubleDays <= 60 && (
                              <p className="text-xs text-gray-600 mt-2">
                                {language === "sv"
                                  ? `${60 - calculatedDoubleDays} dubbeldagar kvar av max 60`
                                  : `${60 - calculatedDoubleDays} double days remaining of max 60`}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Municipality and Tax Settings */}
                  <div className="mb-6">
                    <MunicipalitySelector
                      selectedMunicipality={selectedMunicipality}
                      onMunicipalityChange={handleMunicipalityChange}
                      isChurchMember={isChurchMember}
                      onChurchMemberChange={setIsChurchMember}
                    />
                  </div>

                  {/* Parent Cards */}
                  <div className="space-y-6 mb-6">
                    {parents.slice(0, numParents).map((parent, idx) => (
                      <ParentCard
                        key={parent.id}
                        parent={parent}
                        index={idx}
                        benefits={parentResults[idx]}
                        onUpdate={(field, value) =>
                          updateParent(parent.id, field, value)
                        }
                      />
                    ))}

                    {/* Days Summary */}
                    <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <h4 className="text-lg font-semibold text-indigo-900 mb-4">
                        {language === "sv" ? "Dagfördelning" : "Days Breakdown"}
                      </h4>

                      {/* Days breakdown */}
                      <div className="space-y-3 mb-4">
                        {parents.slice(0, numParents).map((parent, idx) => (
                          <div
                            key={parent.id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-gray-700">
                              {parent.name}:
                            </span>
                            <span className="text-lg font-semibold text-indigo-900">
                              {parent.daysToTake}{" "}
                              {language === "sv" ? "dagar" : "days"}
                            </span>
                          </div>
                        ))}

                        {numParents === 2 && calculatedDoubleDays > 0 && (
                          <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">
                                {t.doubleDaysLabel}:
                              </span>
                              <InfoTooltip
                                title={t.doubleDaysTooltipTitle}
                                content={
                                  language === "sv"
                                    ? "När båda föräldrar tar ut samtidigt används extra dagar från totalen. Exempel: 30 dubbeldagar = båda tar 30 dagar samtidigt = 60 dagar från 480-poolen."
                                    : "When both parents take leave simultaneously, extra days are used from the total. Example: 30 double days = both take 30 days together = 60 days from the 480-day pool."
                                }
                                link="https://www.forsakringskassan.se/foralder/foraldrapenning/bada-foraldrar-lediga-samtidigt"
                              />
                            </div>
                            <span className="text-lg font-semibold text-orange-600">
                              +{calculatedDoubleDays}{" "}
                              {language === "sv" ? "dagar" : "days"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Total summary */}
                      <div className="pt-4 border-t-2 border-indigo-300">
                        {/* Visual progress bar */}
                        <div className="mb-4">
                          <div className="h-8 bg-gray-200 rounded-lg overflow-hidden flex">
                            {numParents >= 1 && (
                              <div
                                className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${(parents[0].daysToTake / TOTAL_PARENTAL_DAYS) * 100}%`,
                                }}
                                title={`${parents[0].name}: ${parents[0].daysToTake} ${language === "sv" ? "dagar" : "days"}`}
                              >
                                {parents[0].daysToTake > 30 && parents[0].name}
                              </div>
                            )}
                            {numParents === 2 && (
                              <div
                                className="bg-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${(parents[1].daysToTake / TOTAL_PARENTAL_DAYS) * 100}%`,
                                }}
                                title={`${parents[1].name}: ${parents[1].daysToTake} ${language === "sv" ? "dagar" : "days"}`}
                              >
                                {parents[1].daysToTake > 30 && parents[1].name}
                              </div>
                            )}
                            {calculatedDoubleDays > 0 && (
                              <div
                                className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold"
                                style={{
                                  width: `${(calculatedDoubleDays / TOTAL_PARENTAL_DAYS) * 100}%`,
                                }}
                                title={`${language === "sv" ? "Dubbeldagar" : "Double days"}: ${calculatedDoubleDays} ${language === "sv" ? "dagar" : "days"}`}
                              >
                                {calculatedDoubleDays > 15 &&
                                  (language === "sv" ? "Dubbel" : "Double")}
                              </div>
                            )}
                            {daysRemaining > 0 && (
                              <div
                                className="bg-green-200 flex items-center justify-center text-green-800 text-xs font-semibold"
                                style={{
                                  width: `${(daysRemaining / TOTAL_PARENTAL_DAYS) * 100}%`,
                                }}
                                title={`${language === "sv" ? "Återstår" : "Remaining"}: ${daysRemaining} ${language === "sv" ? "dagar" : "days"}`}
                              >
                                {daysRemaining > 30 &&
                                  (language === "sv" ? "Återstår" : "Left")}
                              </div>
                            )}
                          </div>
                          {/* Legend */}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span>
                                {parents[0]?.name ||
                                  (language === "sv"
                                    ? "Förälder 1"
                                    : "Parent 1")}
                              </span>
                            </div>
                            {numParents === 2 && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                <span>
                                  {parents[1]?.name ||
                                    (language === "sv"
                                      ? "Förälder 2"
                                      : "Parent 2")}
                                </span>
                              </div>
                            )}
                            {calculatedDoubleDays > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                                <span>
                                  {language === "sv"
                                    ? "Dubbeldagar"
                                    : "Double days"}
                                </span>
                              </div>
                            )}
                            {daysRemaining > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                                <span>
                                  {language === "sv" ? "Återstår" : "Remaining"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              {t.totalUsedDays}
                            </p>
                            <p className="text-3xl font-bold text-indigo-900">
                              {totalDaysTaken + calculatedDoubleDays} /{" "}
                              {TOTAL_PARENTAL_DAYS}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {t.remainingDays}
                            </p>
                            <p
                              className={`text-3xl font-bold ${
                                daysRemaining < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {daysRemaining}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <ExportButtons
                    parents={parents}
                    parentResults={parentResults}
                    birthDate={birthDate}
                    doubleDays={calculatedDoubleDays}
                    numParents={numParents}
                    monthlyData={getMonthlyData}
                  />

                  {/* Monthly Income Table */}
                  <div className="mt-6">
                    <MonthlyIncomeTable
                      monthlyData={getMonthlyData}
                      numParents={numParents}
                      doubleDays={calculatedDoubleDays}
                    />
                  </div>

                  {/* Summary */}
                  <Summary
                    parents={parents}
                    parentResults={parentResults}
                    totalBenefitAfterTax={totalBenefitAfterTax}
                    totalBenefitBeforeTax={totalBenefitBeforeTax}
                    numParents={numParents}
                  />

                  {/* Footer */}
                  <div className="text-center text-sm text-gray-600 mt-8">
                    <p>{t.disclaimerText}</p>
                    <p className="mt-2">{t.privacyFooterText}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Desktop only */}
          <div className="lg:col-span-4">
            <InfoSidebar
              selectedCard={selectedInfoCard}
              onSelectCard={setSelectedInfoCard}
            />
          </div>
        </div>

        {/* Feedback Footer */}
        <FeedbackFooter />
      </div>
    </div>
  );
};

export default ForaldrapengenCalculator;
