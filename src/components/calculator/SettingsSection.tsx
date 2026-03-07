import React from "react";
import InfoTooltip from "../InfoTooltip";
import MunicipalitySelector from "../MunicipalitySelector";
import { useLanguage } from "../../i18n/LanguageContext";

interface SettingsSectionProps {
  numParents: 1 | 2;
  setNumParents: (n: 1 | 2) => void;
  birthDate: string;
  setBirthDate: (date: string) => void;
  selectedMunicipality: string;
  onMunicipalityChange: (municipality: string, taxRate: number) => void;
  isChurchMember: boolean;
  onChurchMemberChange: (value: boolean) => void;
  calculatedDoubleDays: number;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  numParents,
  setNumParents,
  birthDate,
  setBirthDate,
  selectedMunicipality,
  onMunicipalityChange,
  isChurchMember,
  onChurchMemberChange,
  calculatedDoubleDays,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Antal föräldrar */}
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
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              1
            </button>
            <button
              onClick={() => setNumParents(2)}
              className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                numParents === 2
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              2
            </button>
          </div>
        </div>

        {/* Födelsedatum */}
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
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
          />
        </div>

        {/* Dubbeldagar info */}
        {numParents === 2 && calculatedDoubleDays > 0 && (
          <div
            className={`p-4 rounded-lg border-2 ${
              calculatedDoubleDays > 60
                ? "bg-red-50 border-red-500"
                : "bg-green-50 border-green-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-lg font-semibold ${
                  calculatedDoubleDays > 60 ? "text-red-700" : "text-green-700"
                }`}
              >
                {calculatedDoubleDays > 60 ? "⚠️" : "ℹ️"}{" "}
                {language === "sv" ? "Dubbeldagar" : "Double days"}
              </span>
              <InfoTooltip
                title={t.doubleDaysTooltipTitle}
                content={t.doubleDaysTooltipContent}
                link="https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning/foraldralediga-tillsammans---dubbeldagar"
              />
            </div>
            <p
              className={`text-sm ${
                calculatedDoubleDays > 60 ? "text-red-700" : "text-gray-700"
              }`}
            >
              {language === "sv"
                ? `Era perioder överlappar med ${calculatedDoubleDays} dagar. Detta använder ${
                    calculatedDoubleDays * 2
                  } dagar från era 480 dagar.`
                : `Your periods overlap by ${calculatedDoubleDays} days. This uses ${
                    calculatedDoubleDays * 2
                  } days from your 480 days.`}
            </p>
            {calculatedDoubleDays > 60 && (
              <p className="text-sm text-red-700 mt-2 font-semibold">
                {language === "sv"
                  ? "⚠️ Max 60 dubbeldagar tillåts! Justera era start/slutdatum för att minska överlappningen."
                  : "⚠️ Max 60 double days allowed! Adjust your start/end dates to reduce overlap."}
              </p>
            )}
            {calculatedDoubleDays > 0 && calculatedDoubleDays <= 60 && (
              <p className="text-xs text-gray-600 mt-2">
                {language === "sv"
                  ? `${60 - calculatedDoubleDays} dubbeldagar kvar av max 60`
                  : `${60 - calculatedDoubleDays} double days remaining of max 60`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Municipality Selector */}
      <MunicipalitySelector
        selectedMunicipality={selectedMunicipality}
        onMunicipalityChange={onMunicipalityChange}
        isChurchMember={isChurchMember}
        onChurchMemberChange={onChurchMemberChange}
      />
    </div>
  );
};

export default SettingsSection;
