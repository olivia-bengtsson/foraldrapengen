import React, { useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  isComplete?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  autoScroll?: boolean;
  onNext?: () => void; // NEW: Callback for next button
  showNextButton?: boolean; // NEW: Show next button
  nextButtonText?: string; // NEW: Custom next button text
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isOpen,
  isComplete = false,
  onToggle,
  children,
  autoScroll = false,
  onNext,
  showNextButton = false,
  nextButtonText = "Nästa →",
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when section opens
  useEffect(() => {
    if (isOpen && autoScroll && sectionRef.current) {
      setTimeout(() => {
        const element = sectionRef.current;
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 150);
    }
  }, [isOpen, autoScroll]);

  return (
    <div ref={sectionRef} className="mb-6">
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 rounded-t-lg transition-all ${
          isComplete
            ? "bg-green-50 border-l-4 border-green-500 hover:bg-green-100"
            : isOpen
              ? "bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100"
              : "bg-white border-l-4 border-gray-300 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isComplete
                ? "bg-green-500 text-white shadow-sm"
                : isOpen
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {isComplete ? (
              <Check size={22} strokeWidth={3} />
            ) : isOpen ? (
              <ChevronDown size={22} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={22} strokeWidth={2.5} />
            )}
          </div>

          {/* Title */}
          <div className="text-left">
            <h3
              className={`text-lg font-bold ${
                isComplete
                  ? "text-green-900"
                  : isOpen
                    ? "text-blue-900"
                    : "text-gray-700"
              }`}
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        {isComplete && (
          <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
            ✓ Klart
          </span>
        )}
      </button>

      {/* Content */}
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "bg-white border-l-4 border-r border-b rounded-b-lg shadow-sm"
            : ""
        } ${
          isComplete
            ? "border-green-500"
            : isOpen
              ? "border-blue-500 border-gray-100"
              : ""
        }`}
        style={{
          maxHeight: isOpen ? "10000px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="p-6 space-y-4">
          {children}

          {/* Next button */}
          {isOpen && showNextButton && onNext && (
            <div className="pt-6 mt-6 border-t-2 border-gray-100 flex justify-end">
              <button
                onClick={onNext}
                className="group px-8 py-3.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <span>{nextButtonText}</span>
                <ChevronRight
                  size={20}
                  strokeWidth={3}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
