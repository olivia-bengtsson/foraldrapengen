import React, { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { FK_LINKS } from "../constants";

interface InfoCard {
  id: string;
  title: string;
  content: string;
  link: string;
}

interface InfoCarouselProps {
  selectedCard?: string;
  onSelectCard?: (cardId: string) => void;
}

const InfoCarousel: React.FC<InfoCarouselProps> = ({
  selectedCard,
  onSelectCard,
}) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const infoCards: InfoCard[] = [
    {
      id: "sgi",
      title: t.infoCard1Title,
      content: t.infoCard1Content,
      link: FK_LINKS.SGI,
    },
    {
      id: "reserved",
      title: t.infoCard2Title,
      content: t.infoCard2Content,
      link: FK_LINKS.REGLER,
    },
    {
      id: "levels",
      title: t.infoCard3Title,
      content: t.infoCard3Content,
      link: FK_LINKS.FORALDRAPENNING,
    },
    {
      id: "pag",
      title: t.infoCard4Title,
      content: t.infoCard4Content,
      link: FK_LINKS.PAG,
    },
    {
      id: "double",
      title: t.infoCard5Title,
      content: t.infoCard5Content,
      link: FK_LINKS.DUBBELDAGAR,
    },
    {
      id: "tax",
      title: t.infoCard6Title,
      content: t.infoCard6Content,
      link: FK_LINKS.SKATT,
    },
    {
      id: "apply",
      title: t.infoCard7Title,
      content: t.infoCard7Content,
      link: FK_LINKS.ANSOKAN,
    },
    {
      id: "protect-sgi",
      title: t.infoCard8Title,
      content: t.infoCard8Content,
      link: FK_LINKS.FORALDRAPENNING,
    },
  ];

  const goToNext = () => {
    const next = (currentIndex + 1) % infoCards.length;
    setCurrentIndex(next);
    if (onSelectCard) onSelectCard(infoCards[next].id);
  };

  const goToPrevious = () => {
    const prev = (currentIndex - 1 + infoCards.length) % infoCards.length;
    setCurrentIndex(prev);
    if (onSelectCard) onSelectCard(infoCards[prev].id);
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    if (onSelectCard) onSelectCard(infoCards[index].id);
  };

  const currentCard = infoCards[currentIndex];

  return (
    <div className="bg-gradient-to-r bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 text-white px-4 py-2 flex items-center gap-2">
        <BookOpen size={18} />
        <span className="text-sm font-semibold">{t.infoGuideTitle}</span>
        <span className="text-xs ml-auto">
          {currentIndex + 1} / {infoCards.length}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2">{currentCard.title}</h3>
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {currentCard.content}
        </p>
        <a
          href={currentCard.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-700 hover:text-green-800 underline font-medium"
        >
          {t.readMoreFK}
        </a>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <button
          onClick={goToPrevious}
          className="p-2 hover:bg-green-100 rounded-full transition-colors"
          aria-label="Previous card"
        >
          <ChevronLeft size={20} className="text-green-700" />
        </button>

        {/* Dots */}
        <div className="flex gap-1">
          {infoCards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-green-700" : "bg-green-200"
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-2 hover:bg-green-100 rounded-full transition-colors"
          aria-label="Next card"
        >
          <ChevronRight size={20} className="text-green-700" />
        </button>
      </div>
    </div>
  );
};

export default InfoCarousel;
