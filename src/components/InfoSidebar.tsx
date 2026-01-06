import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { FK_LINKS } from "../constants";

interface InfoCard {
  id: string;
  title: string;
  content: string;
  link: string;
}

interface InfoSidebarProps {
  selectedCard: string;
  onSelectCard: (cardId: string) => void;
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({
  selectedCard,
  onSelectCard,
}) => {
  const { t } = useLanguage();

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

  return (
    <div className="hidden lg:block sticky top-4">
      <div className="bg-white rounded-lg shadow-lg border-2 border-indigo-200 overflow-hidden max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center gap-2">
          <BookOpen size={20} />
          <span className="font-semibold">{t.infoGuideTitle}</span>
        </div>

        {/* Cards list - Now scrollable with hidden scrollbar */}
        <div
          className="overflow-y-auto hide-scrollbar"
          style={{
            maxHeight: "calc(100vh - 350px)",
          }}
        >
          {infoCards.map((card) => (
            <button
              key={card.id}
              onClick={() => onSelectCard(card.id)}
              className={`w-full text-left p-4 border-b border-gray-200 hover:bg-indigo-50 transition-colors ${
                selectedCard === card.id
                  ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                  : ""
              }`}
            >
              <h4 className="font-semibold text-gray-800 text-sm mb-1">
                {card.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {card.content}
              </p>
            </button>
          ))}
        </div>

        {/* Selected card detail */}
        {selectedCard && (
          <div className="p-4 bg-indigo-50 border-t-2 border-indigo-200">
            {(() => {
              const card = infoCards.find((c) => c.id === selectedCard);
              if (!card) return null;
              return (
                <>
                  <h4 className="font-bold text-gray-800 mb-2">{card.title}</h4>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {card.content}
                  </p>
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {t.readMoreFK}
                    <ExternalLink size={14} />
                  </a>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoSidebar;
