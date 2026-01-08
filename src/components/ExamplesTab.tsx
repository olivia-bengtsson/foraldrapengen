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
      color: "blue",
    },
    {
      key: "maxMoney" as ExampleKey,
      icon: DollarSign,
      color: "green",
    },
    {
      key: "balanced" as ExampleKey,
      icon: Heart,
      color: "purple",
    },
    {
      key: "singleParent" as ExampleKey,
      icon: User,
      color: "pink",
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
        {exampleConfigs.map(({ key, icon: Icon, color }) => {
          const example = EXAMPLES[key];
          const firstParent = example.parents[0];
          const totalDays = getTotalDaysFromPeriods(firstParent.periods);
          const numPeriods = firstParent.periods.length;

          return (
            <button
              key={key}
              onClick={() => onLoadExample(key)}
              className={`p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all text-left border-2 border-${color}-200 hover:border-${color}-400`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center text-${color}-600 flex-shrink-0`}
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
                    {firstParent.employerTopUp > 0 && (
                      <p>PAG: {firstParent.employerTopUp}%</p>
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
