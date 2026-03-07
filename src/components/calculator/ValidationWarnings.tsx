import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

interface ValidationWarningsProps {
  warnings: string[];
}

const ValidationWarnings: React.FC<ValidationWarningsProps> = ({
  warnings,
}) => {
  const { language } = useLanguage();

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
        <span>⚠️</span>
        {language === "sv" ? "Viktiga meddelanden" : "Important notices"}
      </h3>
      <ul className="space-y-2">
        {warnings.map((warning, index) => (
          <li key={index} className="text-sm text-orange-900">
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationWarnings;
