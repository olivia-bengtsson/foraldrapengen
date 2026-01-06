import React from "react";
import { X, Info } from "lucide-react";

interface InfoModalProps {
  show: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="text-indigo-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Om Föräldrapengen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Vad är föräldrapenning?
            </h3>
            <p className="text-gray-600 text-sm">
              Föräldrapenning är en ersättning från Försäkringskassan när du är
              ledig för att ta hand om ditt barn. Totalt finns det 480 dagar per
              barn att dela mellan föräldrarna.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Reserverade dagar
            </h3>
            <p className="text-gray-600 text-sm">
              Varje förälder har 90 dagar som är reserverade enbart för dem.
              Resterande dagar kan överföras mellan föräldrarna.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Högnivå vs lågnivå
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              De första 390 dagarna får du ca 80% av din SGI
              (sjukpenninggrundande inkomst). De resterande 90 dagarna får du
              180 kr per dag.
            </p>
            <p className="text-gray-600 text-sm">
              SGI beräknas som 97% av din årsinkomst, med ett tak på 1250 kr/dag
              och ett golv på 250 kr/dag.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Arbetsgivartillägg (PAG)
            </h3>
            <p className="text-gray-600 text-sm">
              Många arbetsgivare har kollektivavtal som ger ytterligare
              ersättning utöver föräldrapenningen, ofta 10-20% extra av
              dagersättningen.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">Dubbeldagar</h3>
            <p className="text-gray-600 text-sm">
              Båda föräldrarna kan vara föräldralediga samtidigt under barnets
              första 18 månader, upp till 30 dagar. Detta förbrukar dubbelt så
              många dagar från totalen.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 mb-2">
              Skatt på föräldrapenning
            </h3>
            <p className="text-gray-600 text-sm">
              Föräldrapenning är skattepliktig inkomst. Kalkylatorn räknar med
              ca 30% skatt för anställda med arbetsgivarinkomst och 25% för
              studenter/arbetslösa.
            </p>
          </section>

          <section className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Viktigt!</h3>
            <p className="text-gray-600 text-sm">
              Denna kalkylator ger endast vägledande beräkningar. För exakta
              uppgifter om din föräldrapenning, kontakta alltid
              Försäkringskassan eller använd deras officiella beräkningsverktyg.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
