import React from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface InfoCard {
  id: string;
  title: string;
  content: string;
  link: string;
  linkText: string;
}

interface InfoSidebarProps {
  selectedCard: string;
  onSelectCard: (cardId: string) => void;
}

const InfoSidebar: React.FC<InfoSidebarProps> = ({
  selectedCard,
  onSelectCard,
}) => {
  const { language } = useLanguage();

  const infoCards: InfoCard[] = [
    {
      id: "sgi",
      title:
        language === "sv"
          ? "SGI - Sjukpenninggrundande inkomst"
          : "SGI - Sickness Benefit Qualifying Income",
      content:
        language === "sv"
          ? "SGI är din årliga arbetsinkomst som används för att beräkna föräldrapenning. Den baseras på din bruttolön eller företagsinkomst och bestäms av Försäkringskassan när du ansöker om ersättning. För 2026 är högsta SGI 592 000 kr (10 prisbasbelopp) och lägsta 14 200 kr."
          : "SGI is your annual work income used to calculate parental leave benefits. It's based on your gross salary or business income and determined by Försäkringskassan when you apply. For 2026, the maximum SGI is 592,000 SEK and minimum 14,200 SEK.",
      link: "https://www.forsakringskassan.se/privatperson/sjukpenninggrundande-inkomst-sgi",
      linkText: language === "sv" ? "Läs mer om SGI" : "Read more about SGI",
    },
    {
      id: "reserved",
      title: language === "sv" ? "Reserverade dagar" : "Reserved Days",
      content:
        language === "sv"
          ? "Av de 480 föräldrapenningdagarna är 90 dagar per förälder reserverade och kan inte föras över till den andra föräldern. Dessa dagar är på sjukpenningnivå och syftar till att uppmuntra jämställd föräldraledighet. Du behåller rätten till dina reserverade dagar även om den andra föräldern inte vill ta ut sina."
          : "Of the 480 parental leave days, 90 days per parent are reserved and cannot be transferred to the other parent. These days are at sickness benefit level and aim to encourage equal parental leave. You keep the right to your reserved days even if the other parent doesn't want to use theirs.",
      link: "https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning/fler-dubbeldagar-och-nya-regler-for-vem-som-kan-fa-foraldrapenning",
      linkText:
        language === "sv"
          ? "Läs mer om att föra över dagar"
          : "Read more about transferring days",
    },
    {
      id: "levels",
      title: language === "sv" ? "Ersättningsnivåer" : "Benefit Levels",
      content:
        language === "sv"
          ? "Föräldrapenning betalas på tre nivåer: Sjukpenningnivå (390 dagar) - cirka 80% av din SGI, max 1 259 kr/dag för 2026. Grundnivå - 250 kr/dag om du saknar SGI. Lägstanivå (90 dagar) - 180 kr/dag. På föräldrapenningen betalar du skatt, och du får inte jobbskatteavdrag vilket gör att du får lite mindre än 80% netto."
          : "Parental allowance is paid at three levels: Sickness benefit level (390 days) - approximately 80% of your SGI, max 1,259 SEK/day for 2026. Basic level - 250 SEK/day if you lack SGI. Minimum level (90 days) - 180 SEK/day. Parental allowance is taxed and you don't receive job tax credit, which means you get slightly less than 80% net.",
      link: "https://www.forsakringskassan.se/privatperson/foralder/rakna-pa-foraldrapenning",
      linkText:
        language === "sv"
          ? "Räkna på din föräldrapenning"
          : "Calculate your parental allowance",
    },
    {
      id: "pag",
      title:
        language === "sv"
          ? "PAG - Föräldrapenningtillägg"
          : "PAG - Parental Allowance Supplement",
      content:
        language === "sv"
          ? "Om din arbetsgivare har kollektivavtal kan du få föräldrapenningtillägg (PAG) från arbetsgivaren utöver föräldrapenningen från Försäkringskassan. Vanligt är 10% av lönen upp till SGI-taket (49 000 kr/mån 2025) och 90% av lönen över taket. Detta betalas ofta i 3-12 månader beroende på anställningstid och avtal."
          : "If your employer has a collective agreement, you may receive a parental allowance supplement (PAG) from your employer in addition to parental allowance from Försäkringskassan. Typically 10% of salary up to the SGI ceiling (49,000 SEK/month 2025) and 90% of salary above the ceiling. This is often paid for 3-12 months depending on employment duration and agreement.",
      link: "https://www.st.org/rad-och-stod/dig-som-foralder/foraldralon",
      linkText: language === "sv" ? "Läs mer om PAG" : "Read more about PAG",
    },
    {
      id: "double",
      title: language === "sv" ? "Dubbeldagar" : "Double Days",
      content:
        language === "sv"
          ? "Under barnets första 15 månader kan båda föräldrarna ta ut föräldrapenning samtidigt, så kallade dubbeldagar. Ni kan ta ut max 60 dubbeldagar totalt. Varje dubbeldag räknas som en dag för vardera föräldern (2 dagar förbrukas). Dubbeldagar kan inte tas ut från de 90 reserverade dagarna. Detta är ett bra sätt att vara hemma tillsammans i början."
          : "During the child's first 15 months, both parents can take parental allowance simultaneously, called double days. You can take max 60 double days total. Each double day counts as one day for each parent (2 days consumed). Double days cannot be taken from the 90 reserved days. This is a great way to be home together in the beginning.",
      link: "https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning/fler-dubbeldagar-och-nya-regler-for-vem-som-kan-fa-foraldrapenning",
      linkText:
        language === "sv"
          ? "Läs mer om dubbeldagar"
          : "Read more about double days",
    },
    {
      id: "tax",
      title:
        language === "sv"
          ? "Skatt på föräldrapenning"
          : "Tax on Parental Allowance",
      content:
        language === "sv"
          ? "Föräldrapenning är skattepliktig inkomst precis som lön. Försäkringskassan drar automatiskt preliminärskatt enligt din skattetabell. Skatten varierar mellan kommuner (ca 28-35%) och beror på din totala årsinkomst. Du får INTE jobbskatteavdrag på föräldrapenning, vilket betyder att du får ut mindre än om du arbetar med samma SGI."
          : "Parental allowance is taxable income just like salary. Försäkringskassan automatically deducts preliminary tax according to your tax table. Tax varies between municipalities (approx. 28-35%) and depends on your total annual income. You do NOT receive job tax credit on parental allowance, which means you receive less than if you work with the same SGI.",
      link: "https://www.forsakringskassan.se/privatperson/foralder/foraldrapenning",
      linkText:
        language === "sv"
          ? "Läs mer om föräldrapenning"
          : "Read more about parental allowance",
    },
  ];

  return (
    <div className="hidden lg:block sticky top-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="bg-green-700 text-white px-4 py-3 flex items-center gap-2">
          <BookOpen size={20} />
          <span className="font-semibold">
            {language === "sv" ? "Snabbguide" : "Quick Guide"}
          </span>
        </div>

        {/* Accordion list */}
        <div
          className="overflow-y-auto hide-scrollbar"
          style={{
            maxHeight: "calc(100vh - 120px)",
          }}
        >
          {infoCards.map((card) => {
            const isOpen = selectedCard === card.id;

            return (
              <div
                key={card.id}
                className="border-b border-gray-200 last:border-b-0"
              >
                {/* Accordion header */}
                <button
                  onClick={() => onSelectCard(isOpen ? "" : card.id)}
                  className="w-full text-left p-4 hover:bg-green-50 transition-colors flex items-start justify-between gap-2"
                >
                  <h4 className="font-semibold text-gray-800 text-sm flex-1">
                    {card.title}
                  </h4>
                  <div className="flex-shrink-0 text-green-700">
                    {isOpen ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                </button>

                {/* Accordion content */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-3 bg-white border-t border-gray-200">
                    <p className="text-sm text-gray-900 mb-3 leading-relaxed">
                      {card.content}
                    </p>
                    <a
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium hover:underline"
                    >
                      {card.linkText}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfoSidebar;
