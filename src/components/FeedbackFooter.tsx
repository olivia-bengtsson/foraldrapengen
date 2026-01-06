import React from "react";
import { MessageCircle, Instagram, Heart, Lightbulb } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const FeedbackFooter: React.FC = () => {
  const { language } = useLanguage();

  const openInstagram = () => {
    window.open(
      "https://instagram.com/foraldrapengen",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="mt-12 mb-8">
      {/* Main Feedback Section */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
              <Heart className="text-white" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {language === "sv"
              ? "Vi värdesätter din feedback!"
              : "We Value Your Feedback!"}
          </h2>

          <p className="text-gray-700 text-lg mb-6">
            {language === "sv"
              ? "Föräldrapengen är under ständig utveckling. Dina idéer och förslag hjälper oss att bli bättre!"
              : "Föräldrapengen is constantly evolving. Your ideas and suggestions help us improve!"}
          </p>

          {/* Feature Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border-2 border-pink-200 hover:border-pink-400 transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <MessageCircle className="text-pink-600" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {language === "sv" ? "Feedback" : "Feedback"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === "sv"
                      ? "Hittade du en bugg? Något som inte stämmer? Berätta för oss!"
                      : "Found a bug? Something incorrect? Let us know!"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb className="text-purple-600" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {language === "sv"
                      ? "Funktionsförslag"
                      : "Feature Requests"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === "sv"
                      ? "Vad saknas? Vilka funktioner skulle göra kalkylatorn ännu bättre?"
                      : "What's missing? What features would make the calculator better?"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram CTA Button */}
          <button
            onClick={openInstagram}
            className="group bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 hover:shadow-xl flex items-center gap-3 mx-auto"
          >
            <div className="p-2 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-all">
              <Instagram size={24} />
            </div>
            <div className="text-left">
              <div className="text-sm opacity-90">
                {language === "sv" ? "Kontakta oss på" : "Contact us on"}
              </div>
              <div className="text-lg font-bold">@foraldrapengen</div>
            </div>
          </button>

          {/* Additional Info */}
          <p className="text-sm text-gray-600 mt-6">
            {language === "sv"
              ? "📱 Följ oss också för tips, uppdateringar och föräldraledighetsinspiration!"
              : "📱 Follow us for tips, updates and parental leave inspiration!"}
          </p>
        </div>
      </div>

      {/* Mini Footer with Privacy Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-600">🔒</span>
            <span>
              {language === "sv"
                ? "All data hanteras lokalt i din webbläsare"
                : "All data is handled locally in your browser"}
            </span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">⚠️</span>
            <span>
              {language === "sv"
                ? "Beräkningarna är vägledande - kontakta FK för exakta uppgifter"
                : "Calculations are indicative - contact FK for exact figures"}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-xs text-gray-500">
          <p>
            © 2026 Föräldrapengen -{" "}
            {language === "sv" ? "Skapad med" : "Made with"} ❤️{" "}
            {language === "sv"
              ? "för svenska föräldrar"
              : "for Swedish parents"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackFooter;
