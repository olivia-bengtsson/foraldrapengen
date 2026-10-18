import React from "react";
import { Lightbulb, Clock, DollarSign, Heart, User } from "lucide-react";
import { EXAMPLES, ExampleKey } from "../constants";
import { getTotalDaysFromPeriods } from "../utils/periodHelpers";

interface ExamplesTabProps {
  onLoadExample: (exampleKey: ExampleKey) => void;
}

const ExamplesTab: React.FC<ExamplesTabProps> = ({ onLoadExample }) => {
  const exampleConfigs = [
    {
      key: "maxTime" as ExampleKey,
      icon: Clock,
      // Fullständiga klassnamn så att Tailwind 3 hittar dem
      cardClass: "border-blue-200 hover:border-blue-400",
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      key: "maxMoney" as ExampleKey,
      icon: DollarSign,
      // Fullständiga klassnamn så att Tailwind 3 hittar dem
      cardClass: "border-green-200 hover:border-green-400",
      iconClass: "bg-green-100 text-green-600",
    },
    {
      key: "balanced" as ExampleKey,
      icon: Heart,
      // Fullständiga klassnamn så att Tailwind 3 hittar dem
      cardClass: "border-purple-200 hover:border-purple-400",
      iconClass: "bg-purple-100 text-purple-600",
    },
    {
      key: "singleParent" as ExampleKey,
      icon: User,
      // Fullständiga klassnamn så att Tailwind 3 hittar dem
      cardClass: "border-pink-200 hover:border-pink-400",
      iconClass: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-4">
          <Lightbulb size={20} />
          <span className="font-semibold">Exempelscenarier</span>
        </div>
        <p className="text-gray-600">
          Klicka på ett scenario för att se hur det skulle se ut för er
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exampleConfigs.map(({ key, icon: Icon, cardClass, iconClass }) => {
          const example = EXAMPLES[key];
          const firstParent = example.parents[0];
          const totalDays = getTotalDaysFromPeriods(firstParent.periods);
          const numPeriods = firstParent.periods.length;

          return (
            <button
              key={key}
              onClick={() => onLoadExample(key)}
              className={`p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all text-left border-2 ${cardClass}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${iconClass} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {example.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {example.description}
                  </p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>Föräldrar: {example.parents.length === 1 ? "1" : "2"}</p>
                    <p>Totalt dagar: {totalDays}</p>
                    <p>Antal perioder: {numPeriods}</p>
                    {numPeriods === 1 && (
                      <p>
                        Dagar per vecka: {firstParent.periods[0].daysPerWeek}
                      </p>
                    )}
                    {firstParent.topUpUnderCeilingPercent > 0 && (
                      <p>
                        Föräldralön: {firstParent.topUpUnderCeilingPercent} % i{" "}
                        {firstParent.topUpDays} dagar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExamplesTab;
