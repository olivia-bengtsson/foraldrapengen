import React, { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Baby,
  MapPin,
  Calendar,
  Users,
  Calculator,
  Download,
  Check,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Baby,
      titleSv: "Välkommen till Föräldrapengen!",
      titleEn: "Welcome to the Parental Benefit Calculator!",
      descriptionSv:
        "Den mest exakta kalkylatorn för att planera er föräldraledighet. Vi hjälper dig att förstå hur mycket ni får i ersättning och hur länge era dagar räcker.",
      descriptionEn:
        "The most accurate calculator for planning your parental leave. We help you understand how much you'll receive and how long your days will last.",
    },
    {
      icon: Calendar,
      titleSv: "Steg 1: Grundinställningar",
      titleEn: "Step 1: Basic Settings",
      descriptionSv:
        "Börja med att ange antal föräldrar, barnets födelsedatum och om ni vill använda dubbeldagar (när båda är lediga samtidigt).",
      descriptionEn:
        "Start by entering the number of parents, child's birth date, and whether you want to use double days (when both are on leave simultaneously).",
    },
    {
      icon: MapPin,
      titleSv: "Steg 2: Välj din kommun",
      titleEn: "Step 2: Select Your Municipality",
      descriptionSv:
        "Välj din kommun för att få exakt skatt baserat på var du bor. Skatten varierar mellan 29% och 35% i Sverige!",
      descriptionEn:
        "Select your municipality to get exact tax based on where you live. Tax varies between 29% and 35% in Sweden!",
    },
    {
      icon: Users,
      titleSv: "Steg 3: Fyll i föräldrarnas uppgifter",
      titleEn: "Step 3: Enter Parents' Information",
      descriptionSv:
        "Ange lön, arbetsgivartillägg (PAG), antal dagar ni vill ta ut och när ni planerar att vara lediga. Kalkylatorn beräknar automatiskt slutdatum och ersättning!",
      descriptionEn:
        "Enter salary, employer top-up (PAG), number of days to take, and when you plan to be on leave. The calculator automatically calculates end date and benefits!",
    },
    {
      icon: Calculator,
      titleSv: "Steg 4: Se dina resultat",
      titleEn: "Step 4: View Your Results",
      descriptionSv:
        "Få en detaljerad översikt över er föräldrapenning, SGI, dagersättning och total ersättning. Se även månadsinkomst över tid!",
      descriptionEn:
        "Get a detailed overview of your parental benefit, SGI, daily benefit and total compensation. Also see monthly income over time!",
    },
    {
      icon: Download,
      titleSv: "Steg 5: Exportera din plan",
      titleEn: "Step 5: Export Your Plan",
      descriptionSv:
        "När du är nöjd kan du kopiera all data till urklipp eller ladda ner som Excel. All info du behöver för Försäkringskassan finns med!",
      descriptionEn:
        "When satisfied, copy all data to clipboard or download as Excel. All info you need for the Social Insurance Agency is included!",
    },
    {
      icon: Check,
      titleSv: "Redo att börja!",
      titleEn: "Ready to Start!",
      descriptionSv:
        "Kom ihåg: All data hanteras lokalt i din webbläsare. Inget sparas på servern. Beräkningarna är vägledande - kontakta Försäkringskassan för exakta uppgifter.",
      descriptionEn:
        "Remember: All data is handled locally in your browser. Nothing is saved on the server. Calculations are indicative - contact the Social Insurance Agency for exact figures.",
    },
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
        style={{ height: "min(520px, 85vh)" }}
      >
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white relative flex-shrink-0">
          {/* Language and Close buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex bg-white bg-opacity-20 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() =>
                  language === "en" &&
                  window.dispatchEvent(
                    new CustomEvent("changeLanguage", { detail: "sv" })
                  )
                }
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === "sv"
                    ? "bg-white text-indigo-600"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
              >
                SV
              </button>
              <button
                onClick={() =>
                  language === "sv" &&
                  window.dispatchEvent(
                    new CustomEvent("changeLanguage", { detail: "en" })
                  )
                }
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === "en"
                    ? "bg-white text-indigo-600"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
              >
                EN
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4 pr-32">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm flex-shrink-0">
              <IconComponent size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-tight">
                {language === "sv"
                  ? currentStepData.titleSv
                  : currentStepData.titleEn}
              </h2>
              <p className="text-sm text-indigo-100 mt-1">
                {language === "sv"
                  ? `Steg ${currentStep + 1} av ${steps.length}`
                  : `Step ${currentStep + 1} of ${steps.length}`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-indigo-800 bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content - scrollable with fixed height */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              {language === "sv"
                ? currentStepData.descriptionSv
                : currentStepData.descriptionEn}
            </p>

            {/* Visual hint based on step */}
            {currentStep === 1 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={20} className="text-indigo-600" />
                  <span className="font-semibold text-indigo-900">
                    {language === "sv" ? "Tips:" : "Tip:"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {language === "sv"
                    ? "Ni har totalt 480 dagar att dela mellan er. Varje förälder har 90 reserverade dagar."
                    : "You have a total of 480 days to share. Each parent has 90 reserved days."}
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-indigo-600" />
                  <span className="font-semibold text-indigo-900">
                    {language === "sv" ? "Exempel:" : "Example:"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {language === "sv"
                    ? "Österåker har lägst skatt (28.98%) medan Degerfors har högst (35.30%). Skillnaden kan bli 13,000 kr för 240 dagar!"
                    : "Österåker has the lowest tax (28.98%) while Degerfors has the highest (35.30%). The difference can be 13,000 SEK for 240 days!"}
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <Download size={20} className="text-indigo-600" />
                  <span className="font-semibold text-indigo-900">
                    {language === "sv" ? "Exportformaten:" : "Export Formats:"}
                  </span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>
                    {language === "sv"
                      ? "Kopiera till urklipp - För anteckningar"
                      : "Copy to clipboard - For notes"}
                  </li>
                  <li>
                    {language === "sv"
                      ? "Excel/CSV - För kalkylprogram"
                      : "Excel/CSV - For spreadsheet programs"}
                  </li>
                </ul>
              </div>
            )}

            {currentStep === 6 && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700">
                    <strong className="text-indigo-900">
                      🔒 {language === "sv" ? "Integritet:" : "Privacy:"}
                    </strong>{" "}
                    {language === "sv"
                      ? "All data hanteras lokalt. Inget sparas på servern."
                      : "All data is handled locally. Nothing is saved on the server."}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-700">
                    <strong className="text-amber-900">
                      ⚠️ {language === "sv" ? "Disclaimer:" : "Disclaimer:"}
                    </strong>{" "}
                    {language === "sv"
                      ? "Beräkningarna är vägledande. Kontakta Försäkringskassan för exakta uppgifter."
                      : "Calculations are indicative. Contact the Social Insurance Agency for exact figures."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            {language === "sv" ? "Hoppa över" : "Skip"}
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                {language === "sv" ? "Tillbaka" : "Back"}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  {language === "sv" ? "Kom igång!" : "Get Started!"}
                  <Check size={20} />
                </>
              ) : (
                <>
                  {language === "sv" ? "Nästa" : "Next"}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 pb-4 flex-shrink-0">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "bg-indigo-600 w-8"
                  : index < currentStep
                    ? "bg-indigo-400 w-2"
                    : "bg-gray-300 w-2"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OnboardingGuide;
