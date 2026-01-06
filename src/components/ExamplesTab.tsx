import React from "react";
import { Lightbulb, Clock, DollarSign, Heart, User } from "lucide-react";
import { EXAMPLES, ExampleKey } from "../constants";

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
                    <p>Dagar per vecka: {example.parents[0].daysPerWeek}</p>
                    {example.parents[0].employerTopUp > 0 && (
                      <p>PAG: {example.parents[0].employerTopUp}%</p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Om dessa scenarier</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            • <strong>Maximera tid:</strong> Prioriterar längsta möjliga tid med
            barnet genom att dela dagar jämnt och ta ledigt färre dagar per
            vecka
          </li>
          <li>
            • <strong>Maximera inkomst:</strong> Högre lön och
            arbetsgivartillägg, samt att ta ledigt 7 dagar/vecka för snabb
            återgång till arbete
          </li>
          <li>
            • <strong>Balanserat:</strong> En medelväg mellan tid och pengar med
            realistiska förutsättningar
          </li>
          <li>
            • <strong>Ensamförälder:</strong> När en förälder tar alla 480 dagar
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExamplesTab;
