import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Parent, ParentBenefits, MonthlyData } from "../types";
import {
  generateCopyText,
  copyToClipboard,
  generateExcelExport,
} from "../utils/exportUtils";
import { useLanguage } from "../i18n/LanguageContext";

interface ExportButtonsProps {
  parents: Parent[];
  parentResults: ParentBenefits[];
  birthDate: string;
  doubleDays: number;
  numParents: 1 | 2;
  monthlyData: MonthlyData[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  parents,
  parentResults,
  birthDate,
  doubleDays,
  numParents,
  monthlyData,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generateCopyText(
      parents,
      parentResults,
      birthDate,
      doubleDays,
      numParents
    );

    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleExcelExport = () => {
    generateExcelExport(
      parents,
      parentResults,
      birthDate,
      doubleDays,
      numParents,
      monthlyData
    );
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {t.exportTitle}
      </h3>
      <p className="text-sm text-gray-600 mb-4">{t.exportSubtitle}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-green-500 text-green-700 rounded-lg font-semibold transition-all shadow-sm hover:shadow"
        >
          {copied ? (
            <>
              <Check size={20} />
              {t.copied}
            </>
          ) : (
            <>
              <Copy size={20} />
              {t.copyToClipboard}
            </>
          )}
        </button>

        <button
          onClick={handleExcelExport}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow"
        >
          <Download size={20} />
          {t.downloadExcel}
        </button>
      </div>

      <div className="mt-4 p-3 bg-white rounded border border-green-200">
        <p className="text-xs text-gray-600">
          <strong>{t.exportIncludesLabel}</strong> {t.exportIncludesText}
        </p>
        <p className="text-xs text-gray-600 mt-2">
          <strong>{t.privacyLabel}</strong> {t.privacyText}
        </p>
      </div>
    </div>
  );
};

export default ExportButtons;
