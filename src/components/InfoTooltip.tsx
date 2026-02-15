import React, { useState } from "react";
import { Info, X } from "lucide-react";

interface InfoTooltipProps {
  title: string;
  content: string;
  link?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, content, link }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 text-green-700 hover:text-green-800 transition-colors"
        type="button"
      >
        <Info size={18} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div className="absolute z-50 w-80 p-4 bg-white rounded-lg shadow-xl border-2 border-gray-200 left-0 mt-2">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{content}</p>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-700 hover:text-green-800 underline"
              >
                Läs mer på Försäkringskassan →
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InfoTooltip;
