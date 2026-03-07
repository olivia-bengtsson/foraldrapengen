import React, { useState } from "react";
import { Parent, ParentBenefits, ParentalPeriod } from "../types";
import {
  getTotalDaysFromPeriods,
  validateNoOverlap,
} from "../utils/periodHelpers";
import PeriodCard from "./PeriodCard";
import InfoTooltip from "./InfoTooltip";
import { useLanguage } from "../i18n/LanguageContext";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

interface ParentCardProps {
  parent: Parent;
  index: number;
  benefits: ParentBenefits;
  onUpdate: (field: keyof Parent, value: any) => void;
  onUpdatePeriod: (
    periodId: string,
    field: keyof ParentalPeriod,
    value: any
  ) => void;
  onAddPeriod: () => void;
  onDeletePeriod: (periodId: string) => void;
}

const ParentCard: React.FC<ParentCardProps> = ({
  parent,
  index,
  benefits,
  onUpdate,
  onUpdatePeriod,
  onAddPeriod,
  onDeletePeriod,
}) => {
  const { t, language } = useLanguage();
  const [showPeriods, setShowPeriods] = useState(false);

  // Calculate total days from all periods
  const totalDays = getTotalDaysFromPeriods(parent.periods);

  // Validate periods for overlap
  const validation = validateNoOverlap(parent.periods);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg">
          {index + 1}
        </div>
        <input
          type="text"
          value={parent.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          className="text-xl font-bold bg-white border border-gray-300 rounded px-3 py-2 flex-1 min-w-0"
        />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.monthlySalaryLabel}
            </label>
            <InfoTooltip
              title={t.salaryTooltipTitle}
              content={t.salaryTooltipContent}
              link="https://www.forsakringskassan.se/sjuk/berakna-sgi"
            />
          </div>
          <input
            type="number"
            value={parent.monthlySalary}
            onChange={(e) => onUpdate("monthlySalary", Number(e.target.value))}
            min="0"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
            placeholder="35000"
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.employerTopUpLabel}
            </label>
            <InfoTooltip
              title={t.pagTooltipTitle}
              content={t.pagTooltipContent}
              link="https://www.forsakringskassan.se/foralder/foraldrapenning/arbetsgivaren-betalar-mer"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                {language === "sv" ? "Procent (%)" : "Percent (%)"}
              </label>
              <input
                type="number"
                value={parent.employerTopUp}
                onChange={(e) =>
                  onUpdate("employerTopUp", Number(e.target.value))
                }
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                {language === "sv" ? "Antal dagar" : "Number of days"}
              </label>
              <input
                type="number"
                value={parent.employerTopUpDays}
                onChange={(e) =>
                  onUpdate("employerTopUpDays", Number(e.target.value))
                }
                min="0"
                max="390"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-green-600 focus:outline-none"
                placeholder="360"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {language === "sv"
              ? "Vanligt är 10% för 180-360 dagar. Kolla ditt kollektivavtal!"
              : "Common is 10% for 180-360 days. Check your collective agreement!"}
          </p>
        </div>

        {/* Help Section - Expandable */}
        <div className="border-t border-gray-200 pt-4">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-blue-700 font-semibold text-sm">
                    💡 {language === "sv" ? "Hjälp & Regler" : "Help & Rules"}
                  </span>
                </div>
                <ChevronRight
                  className="group-open:rotate-90 transition-transform text-blue-600"
                  size={20}
                />
              </div>
            </summary>

            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
              {/* Totala dagar */}
              <div>
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {language === "sv"
                    ? "📊 Totalt antal dagar"
                    : "📊 Total days"}
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>
                    • <strong>480 dagar totalt</strong>{" "}
                    {language === "sv" ? "för ett barn" : "for one child"}
                  </li>
                  <li>
                    • <strong>90 dagar reserverade</strong>{" "}
                    {language === "sv"
                      ? "per förälder - kan INTE föras över"
                      : "per parent - CANNOT be transferred"}
                  </li>
                  <li>
                    • <strong>Övriga dagar</strong>{" "}
                    {language === "sv"
                      ? "kan fördelas fritt mellan föräldrarna"
                      : "can be freely divided between parents"}
                  </li>
                  <li className="text-blue-700">
                    💡{" "}
                    {language === "sv"
                      ? "Det är inte 240 dagar per förälder automatiskt - ni väljer själva!"
                      : "It's not 240 days per parent automatically - you choose!"}
                  </li>
                </ul>
              </div>

              {/* Ersättningsnivåer */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {language === "sv"
                    ? "💰 Ersättningsnivåer"
                    : "💰 Benefit levels"}
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>
                    •{" "}
                    <strong className="text-green-700">Sjukpenningnivå:</strong>{" "}
                    {language === "sv"
                      ? "~80% av lön (390 dagar totalt)"
                      : "~80% of salary (390 days total)"}
                  </li>
                  <li>
                    • <strong className="text-orange-600">Lägstanivå:</strong>{" "}
                    180 kr/dag (
                    {language === "sv" ? "90 dagar totalt" : "90 days total"})
                  </li>
                  <li className="text-orange-700">
                    ⚠️{" "}
                    {language === "sv"
                      ? "Första 180 dagarna (tillsammans) måste vara sjukpenningnivå"
                      : "First 180 days (combined) must be sickness benefit level"}
                  </li>
                </ul>
              </div>

              {/* SGI och lönetak */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {language === "sv"
                    ? "💵 SGI och lönetak"
                    : "💵 SGI and salary cap"}
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>
                    • <strong>SGI-tak 2026:</strong> 592 000 kr/år (49 333
                    kr/mån)
                  </li>
                  <li>
                    •{" "}
                    {language === "sv"
                      ? "Om din lön är högre → ersättning takad vid max"
                      : "If your salary is higher → benefit capped at max"}
                  </li>
                  <li>
                    •{" "}
                    <strong className="text-green-700">
                      {language === "sv"
                        ? "Högsta dagersättning:"
                        : "Maximum daily benefit:"}
                    </strong>{" "}
                    ~1 259 kr/dag
                  </li>
                  <li className="text-orange-700">
                    ⚠️{" "}
                    {language === "sv"
                      ? "Tjänar du 60 000 kr/mån får du INTE 80% av 60 000!"
                      : "Earn 60,000 SEK/month? You DON'T get 80% of 60,000!"}
                  </li>
                </ul>
              </div>

              {/* Arbetsgivartillägg */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {language === "sv"
                    ? "🏢 Arbetsgivartillägg (PAG)"
                    : "🏢 Employer top-up (PAG)"}
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>
                    •{" "}
                    {language === "sv"
                      ? "Många arbetsgivare med kollektivavtal ger extra ersättning"
                      : "Many employers with collective agreements provide extra compensation"}
                  </li>
                  <li>
                    •{" "}
                    <strong>
                      {language === "sv" ? "Vanligt:" : "Common:"}
                    </strong>{" "}
                    10% {language === "sv" ? "av din lön" : "of your salary"}
                  </li>
                  <li>
                    •{" "}
                    {language === "sv"
                      ? "Betalas ofta för max 180-360 dagar"
                      : "Often paid for max 180-360 days"}
                  </li>
                  <li>
                    •{" "}
                    {language === "sv"
                      ? "Betalas ENDAST för sjukpenningnivå-dagar"
                      : "Paid ONLY for sickness benefit level days"}
                  </li>
                  <li className="text-blue-700">
                    💡{" "}
                    {language === "sv"
                      ? "Kolla med din arbetsgivare eller fack vad som gäller för dig!"
                      : "Check with your employer or union what applies to you!"}
                  </li>
                </ul>
              </div>

              {/* Dagar per vecka */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {language === "sv"
                    ? "📅 Dagar per vecka"
                    : "📅 Days per week"}
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>
                    • <strong>7 dagar/vecka:</strong>{" "}
                    {language === "sv"
                      ? "Heltidsledig, dagarna tar slut snabbast"
                      : "Full-time leave, days run out fastest"}
                  </li>
                  <li>
                    • <strong>5 dagar/vecka:</strong>{" "}
                    {language === "sv"
                      ? "Ledig mån-fre, jobbar helger (vanligast)"
                      : "Leave Mon-Fri, work weekends (most common)"}
                  </li>
                  <li>
                    • <strong>2-4 dagar/vecka:</strong>{" "}
                    {language === "sv"
                      ? "Deltidsledig, dagarna räcker längre"
                      : "Part-time leave, days last longer"}
                  </li>
                  <li className="text-blue-700">
                    💡{" "}
                    {language === "sv"
                      ? "Färre dagar/vecka = ledigheten räcker längre i tid"
                      : "Fewer days/week = leave lasts longer over time"}
                  </li>
                </ul>
              </div>

              {/* Dubbeldagar */}
              <div className="border-t border-blue-200 pt-3">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  {language === "sv" ? "👨‍👩‍👦 Dubbeldagar" : "👨‍👩‍👦 Double days"}
                </h4>
                <ul className="text-xs text-gray-700 space-y-1 ml-4">
                  <li>
                    • <strong>Max 60 dagar</strong>{" "}
                    {language === "sv"
                      ? "då båda är hemma samtidigt"
                      : "when both are home together"}
                  </li>
                  <li>
                    •{" "}
                    {language === "sv"
                      ? "Kan tas ut innan barnet fyller "
                      : "Can be used before child turns "}
                    <strong>15 månader</strong>
                  </li>
                  <li>
                    •{" "}
                    {language === "sv"
                      ? "Räknas som 2 dagar totalt (1 från varje förälder)"
                      : "Counts as 2 days total (1 from each parent)"}
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className="border-t border-blue-200 pt-3 bg-green-50 rounded p-2">
                <p className="text-xs text-green-800">
                  <strong>💡 {language === "sv" ? "Tips:" : "Tip:"}</strong>{" "}
                  {language === "sv"
                    ? "Kom ihåg att planera tillsammans! De 90 reserverade dagarna per förälder är fast, men resten (300 dagar) kan ni fördela precis som ni vill. Lägstanivådagar ger bara 180 kr/dag utan arbetsgivartillägg."
                    : "Remember to plan together! The 90 reserved days per parent are fixed, but the rest (300 days) can be divided exactly as you wish. Minimum level days only give 180 SEK/day without employer top-up."}
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* Periods Section */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowPeriods(!showPeriods)}
            className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showPeriods ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
              <span className="font-semibold text-gray-800">
                📅 {language === "sv" ? "Perioder" : "Periods"} (
                {parent.periods.length})
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {language === "sv" ? "Totalt:" : "Total:"}{" "}
              <span className="font-bold text-green-900">{totalDays}</span>{" "}
              {language === "sv" ? "dagar" : "days"}
            </div>
          </button>

          {/* Day breakdown */}
          {parent.periods.length > 0 &&
            (() => {
              let highDays = 0;
              let lowDays = 0;
              let doubleDays = 0;

              parent.periods.forEach((period) => {
                const days = period.daysToTake || 0;
                const level = period.level || "high";

                if (period.isDoubleDay) {
                  doubleDays += days;
                }

                if (level === "high") {
                  highDays += days;
                } else {
                  lowDays += days;
                }
              });

              return (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-green-700">
                        {language === "sv" ? "Sjukpenningnivå" : "High level"}
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        {highDays}
                      </div>
                      <div className="text-gray-600">
                        {language === "sv" ? "dagar" : "days"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-700">
                        {language === "sv" ? "Lägstanivå" : "Low level"}
                      </div>
                      <div className="text-lg font-bold text-orange-900">
                        {lowDays}
                      </div>
                      <div className="text-gray-600">
                        {language === "sv" ? "dagar" : "days"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-700">
                        {language === "sv" ? "Dubbeldagar" : "Double days"}
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {doubleDays}
                      </div>
                      <div className="text-gray-600">
                        {language === "sv" ? "dagar" : "days"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {!validation.valid && (
            <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
              ⚠️ {validation.message}
            </div>
          )}

          {showPeriods && (
            <div className="mt-4 space-y-3">
              {parent.periods.map((period, idx) => (
                <PeriodCard
                  key={period.id}
                  period={period}
                  periodIndex={idx}
                  onUpdate={(field, value) =>
                    onUpdatePeriod(period.id, field, value)
                  }
                  onDelete={() => onDeletePeriod(period.id)}
                  canDelete={parent.periods.length > 1}
                  hasOverlapError={
                    !validation.valid &&
                    validation.overlappingPeriods?.includes(idx)
                  }
                />
              ))}

              <button
                onClick={onAddPeriod}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg border border-gray-300 transition-colors"
              >
                <Plus size={20} />
                <span className="font-semibold">
                  {language === "sv" ? "Lägg till period" : "Add period"}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-white rounded border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t.sgiLabel}</p>
              <p className="font-semibold text-green-900">
                {benefits.sgi.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr/år
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.dailyBenefitAfterTaxLabel}</p>
              <p className="font-semibold text-green-900">
                {benefits.dailyBenefitAfterTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr/dag
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.leaveLabel}</p>
              <p className="font-semibold text-green-900">
                {benefits.monthsNeeded.toFixed(1)} {t.monthsLabel}
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t.highLevelDaysLabel}</p>
              <p className="font-semibold text-green-600">
                {benefits.highLevelDays} {t.daysLabel}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">{t.totalBenefitAfterTaxLabel}</p>
              <p className="font-semibold text-green-600 text-xl">
                {benefits.totalBenefitAfterTax.toLocaleString("sv-SE", {
                  maximumFractionDigits: 0,
                })}{" "}
                kr
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentCard;
