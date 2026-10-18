import React from "react";
import { Parent, ParentalPeriod, ParentBenefits } from "../../types";
import ParentCard from "../ParentCard";
import DaysSummary from "./DaysSummary";

interface ParentsSectionProps {
  parents: Parent[];
  numParents: 1 | 2;
  parentResults: ParentBenefits[];
  calculatedDoubleDays: number;
  onUpdateParent: <K extends keyof Parent>(
    id: number,
    field: K,
    value: Parent[K],
  ) => void;
  onUpdatePeriod: <K extends keyof ParentalPeriod>(
    parentId: number,
    periodId: string,
    field: K,
    value: ParentalPeriod[K],
  ) => void;
  onAddPeriod: (parentId: number) => void;
  onDeletePeriod: (parentId: number, periodId: string) => void;
}

const ParentsSection: React.FC<ParentsSectionProps> = ({
  parents,
  numParents,
  parentResults,
  calculatedDoubleDays,
  onUpdateParent,
  onUpdatePeriod,
  onAddPeriod,
  onDeletePeriod,
}) => {
  return (
    <div className="space-y-6">
      {/* Parent Cards */}
      {parents.slice(0, numParents).map((parent, idx) => (
        <ParentCard
          key={parent.id}
          parent={parent}
          index={idx}
          benefits={parentResults[idx]}
          onUpdate={(field, value) => {
            onUpdateParent(parent.id, field, value);
          }}
          onUpdatePeriod={(periodId, field, value) => {
            onUpdatePeriod(parent.id, periodId, field, value);
          }}
          onAddPeriod={() => onAddPeriod(parent.id)}
          onDeletePeriod={(periodId) => onDeletePeriod(parent.id, periodId)}
        />
      ))}

      {/* Days Summary */}
      <DaysSummary
        parents={parents}
        numParents={numParents}
        calculatedDoubleDays={calculatedDoubleDays}
      />
    </div>
  );
};

export default ParentsSection;
