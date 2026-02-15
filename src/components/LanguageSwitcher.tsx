import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { Language } from "../i18n/translations";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2 border border-gray-200">
      <Globe size={18} className="text-gray-600" />
      <button
        onClick={() => handleLanguageChange("sv")}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === "sv"
            ? "bg-green-700 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        SV
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === "en"
            ? "bg-green-700 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
