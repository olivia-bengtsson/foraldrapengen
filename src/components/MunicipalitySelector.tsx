import React, { useState } from "react";
import { MapPin, Info } from "lucide-react";
import {
  MAJOR_MUNICIPALITIES,
  TAX_STATS_2025,
  EXTREME_MUNICIPALITIES,
  calculateTaxRate,
} from "../data/municipalities";
import { useLanguage } from "../i18n/LanguageContext";

interface MunicipalitySelectorProps {
  selectedMunicipality: string;
  onMunicipalityChange: (municipality: string, taxRate: number) => void;
  isChurchMember: boolean;
  onChurchMemberChange: (isChurchMember: boolean) => void;
}

const MunicipalitySelector: React.FC<MunicipalitySelectorProps> = ({
  selectedMunicipality,
  onMunicipalityChange,
  isChurchMember,
  onChurchMemberChange,
}) => {
  const { t, language } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);

  const handleMunicipalityChange = (municipality: string) => {
    const taxRate = calculateTaxRate(municipality, isChurchMember);
    onMunicipalityChange(municipality, taxRate);
  };

  const handleChurchChange = (checked: boolean) => {
    onChurchMemberChange(checked);
    // Uppdatera skattesats med kyrkoavgift
    const taxRate = calculateTaxRate(selectedMunicipality, checked);
    onMunicipalityChange(selectedMunicipality, taxRate);
  };

  const getCurrentTax = () => {
    if (!selectedMunicipality) return TAX_STATS_2025.average;
    const municipality = MAJOR_MUNICIPALITIES.find(
      (m) => m.name === selectedMunicipality
    );
    return municipality?.totalTax || TAX_STATS_2025.average;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin size={20} />
          {language === "sv" ? "Skatteinställningar" : "Tax Settings"}
        </h3>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-green-100 rounded-full transition-colors"
        >
          <Info size={18} className="text-green-600" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-green-200 text-sm">
          <p className="text-gray-700 mb-2">
            {language === "sv"
              ? "Skatten varierar mellan kommuner i Sverige. Genom att välja din kommun får du mer exakta beräkningar."
              : "Tax rates vary between municipalities in Sweden. By selecting your municipality, you'll get more accurate calculations."}
          </p>

          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-gray-700 font-semibold mb-1">
              {language === "sv"
                ? "⚠️ Viktig information:"
                : "⚠️ Important information:"}
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>
                {language === "sv"
                  ? "Skattesatser från SCB (Statistiska centralbyrån) för 2025"
                  : "Tax rates from SCB (Statistics Sweden) for 2025"}
              </li>
              <li>
                {language === "sv"
                  ? "Kyrkoavgift är approximerad till ~1% (varierar 0.5-1.5% mellan församlingar)"
                  : "Church fee is approximated to ~1% (varies 0.5-1.5% between parishes)"}
              </li>
              <li>
                {language === "sv"
                  ? "Din faktiska skatt kan variera något beroende på din totala inkomst och jobbskatteavdrag"
                  : "Your actual tax may vary slightly depending on your total income and work tax credit"}
              </li>
              <li>
                {language === "sv"
                  ? "För exakt skatt, kontakta Skatteverket eller använd deras skattetabell"
                  : "For exact tax, contact the Swedish Tax Agency or use their tax table"}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div>
              <span className="font-semibold text-green-700">
                {language === "sv" ? "Lägst skatt:" : "Lowest tax:"}
              </span>{" "}
              {EXTREME_MUNICIPALITIES.lowest.name} (
              {EXTREME_MUNICIPALITIES.lowest.totalTax}%)
            </div>
            <div>
              <span className="font-semibold text-red-700">
                {language === "sv" ? "Högst skatt:" : "Highest tax:"}
              </span>{" "}
              {EXTREME_MUNICIPALITIES.highest.name} (
              {EXTREME_MUNICIPALITIES.highest.totalTax}%)
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Municipality Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "sv" ? "Din kommun" : "Your municipality"}
          </label>
          <select
            value={selectedMunicipality}
            onChange={(e) => handleMunicipalityChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none bg-white"
          >
            <option value="">
              {language === "sv"
                ? "Standard (30% skatt)"
                : "Standard (30% tax)"}
            </option>
            <optgroup
              label={language === "sv" ? "Stockholm län" : "Stockholm County"}
            >
              {MAJOR_MUNICIPALITIES.filter((m) => m.county === "Stockholm").map(
                (m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.totalTax}%)
                  </option>
                )
              )}
            </optgroup>
            <optgroup
              label={
                language === "sv" ? "Västra Götaland" : "Västra Götaland County"
              }
            >
              {MAJOR_MUNICIPALITIES.filter(
                (m) => m.county === "Västra Götaland"
              ).map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.totalTax}%)
                </option>
              ))}
            </optgroup>
            <optgroup label={language === "sv" ? "Skåne län" : "Skåne County"}>
              {MAJOR_MUNICIPALITIES.filter((m) => m.county === "Skåne").map(
                (m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.totalTax}%)
                  </option>
                )
              )}
            </optgroup>
            <optgroup
              label={
                language === "sv" ? "Övriga kommuner" : "Other Municipalities"
              }
            >
              {MAJOR_MUNICIPALITIES.filter(
                (m) =>
                  !["Stockholm", "Västra Götaland", "Skåne"].includes(m.county)
              ).map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.totalTax}%)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Church Member Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="churchMember"
            checked={isChurchMember}
            onChange={(e) => handleChurchChange(e.target.checked)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="churchMember" className="ml-2 text-sm text-gray-700">
            {language === "sv"
              ? "Medlem i Svenska kyrkan (+~1% kyrkoavgift)"
              : "Member of Swedish Church (+~1% church fee)"}
          </label>
        </div>

        {/* Current Tax Display */}
        <div className="p-4 bg-white rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {language === "sv" ? "Din skattesats:" : "Your tax rate:"}
            </span>
            <span className="text-2xl font-bold text-green-600">
              {(getCurrentTax() + (isChurchMember ? 1 : 0)).toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {language === "sv"
              ? "Detta påverkar din dagersättning efter skatt"
              : "This affects your daily benefit after tax"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MunicipalitySelector;
