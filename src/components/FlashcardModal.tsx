import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface FlashcardData {
  title: string;
  content: string;
  link?: string;
}

interface FlashcardModalProps {
  show: boolean;
  onClose: () => void;
}

const flashcards: FlashcardData[] = [
  {
    title: "Vad är föräldrapenning?",
    content:
      "Föräldrapenning är en ersättning från Försäkringskassan när du är ledig för att ta hand om ditt barn. Totalt finns det 480 dagar per barn att dela mellan föräldrarna. Du kan ta ut föräldrapenning fram till och med dagen före barnet fyller 12 år.",
    link: "https://www.forsakringskassan.se/foralder/foraldrapenning",
  },
  {
    title: "Reserverade dagar",
    content:
      "Varje förälder har 90 dagar som är reserverade enbart för dem och inte kan överföras till den andra föräldern. Detta är för att uppmuntra båda föräldrarna att ta föräldraledigt. Övriga 300 dagar kan föräldrarna dela upp som de vill.",
    link: "https://www.forsakringskassan.se/foralder/foraldrapenning",
  },
  {
    title: "Sjukpenninggrundande inkomst (SGI)",
    content:
      "SGI är den inkomst som föräldrapenningen beräknas på. Den baseras på din årsinkomst året innan barnet föds, eller under graviditeten. SGI beräknas som 97% av din årsinkomst. Det finns ett tak på 10 prisbasbelopp (ca 573 000 kr/år för 2025).",
    link: "https://www.forsakringskassan.se/sjuk/berakna-sgi",
  },
  {
    title: "Högnivå- och lågnivådagar",
    content:
      "De första 390 dagarna (per barn) får du ca 80% av din SGI - detta kallas högnivådagar. De resterande 90 dagarna får du en lägre ersättning på 180 kr per dag före skatt - detta kallas lågnivådagar. De flesta använder högnivådagarna när barnet är litet.",
    link: "https://www.forsakringskassan.se/foralder/foraldrapenning",
  },
  {
    title: "Arbetsgivartillägg (PAG)",
    content:
      "Många arbetsgivare har kollektivavtal som ger ytterligare ersättning utöver föräldrapenningen, ofta kallat PAG (Avtalad PensionsGrundande inkomst-tillägg). Detta brukar vara 10% extra, men kan vara upp till 20% eller mer beroende på avtal. Kontakta din arbetsgivare eller fackförbund för att ta reda på vad som gäller för dig.",
    link: "https://www.forsakringskassan.se/foralder/foraldrapenning/arbetsgivaren-betalar-mer",
  },
  {
    title: "Dubbeldagar",
    content:
      "Under barnets första 15 månader kan båda föräldrarna vara lediga samtidigt i upp till 60 dagar. När ni tar ut en dubbeldag räknas två dagar av, en för varje förälder. Om ni tar ut alla 60 dubbeldagarna har ni alltså utnyttjat 120 dagar med föräldrapenning från era totala 480 dagar.",
    link: "https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning/foraldralediga-tillsammans---dubbeldagar",
  },
  {
    title: "Dagar per vecka",
    content:
      "Du kan välja att ta ut föräldrapenning mellan 1-7 dagar per vecka. Tar du färre dagar per vecka (t.ex. 5 dagar) räcker dagarna längre i kalendertid, men du får lägre månadsinkomst. Tar du 7 dagar per vecka blir du snabbt klar men får högre månadsinkomst. Många väljer 5-6 dagar per vecka för att balansera.",
    link: "https://www.forsakringskassan.se/foralder/foraldrapenning/ta-ut-pa-deltid",
  },
  {
    title: "Skatt på föräldrapenning",
    content:
      "Föräldrapenning är skattepliktig inkomst precis som lön. Försäkringskassan gör ett preliminärt skatteavdrag när de betalar ut ersättningen. Skatten varierar beroende på din totala årsinkomst, men brukar ligga runt 25-30%. Du kan justera skatten om du vill undvika restskatt.",
    link: "https://www.forsakringskassan.se/foralder/foraldrapenning/skatt-foraldrapenning",
  },
];

const FlashcardModal: React.FC<FlashcardModalProps> = ({ show, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!show) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {flashcards.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {currentCard.title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {currentCard.content}
          </p>
          {currentCard.link && (
            <a
              href={currentCard.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              Läs mer på Försäkringskassan →
            </a>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={goToPrevious}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            Föregående
          </button>

          {/* Dots indicator */}
          <div className="flex gap-2">
            {flashcards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Nästa
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardModal;
