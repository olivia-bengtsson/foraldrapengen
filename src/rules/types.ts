// Struktur för ett års regler och belopp. Varje nytt år (rules2027.ts osv.) måste fylla i alla fält.

export interface ParentalBenefitRules {
  year: number;
  priceBaseAmount: number;

  sgi: {
    /** Högsta SGI, kr/år */
    max: number;
    /** Högsta SGI, kr/mån */
    maxMonthly: number;
    /** Lägsta SGI, kr/år. Under detta blir SGI 0. */
    min: number;
    highLevelRequirement: {
      minMonthlyIncome: number;
      daysBeforeBirth: number;
      appliesToFirstDays: number;
    };
  };

  benefit: {
    sgiFactor: number;
    rate: number;
    /** kr/dag */
    maxDaily: number;
    /** kr/dag, grundnivå */
    basicDaily: number;
    /** kr/dag */
    lowLevelDaily: number;
  };

  days: {
    total: number;
    perParent: number;
    highLevelTotal: number;
    lowLevelTotal: number;
    highLevelPerParent: number;
    lowLevelPerParent: number;
    reservedPerParent: number;
    transferablePerParent: number;
    transferToOtherInsuredMax: number;
    highLevelBeforeLowLevel: number;
    maxDoubleDays: number;
    doubleDaysMaxAgeMonths: number;
    maxSavedDaysAfterAge4: number;
    lastAgeYears: number;
  };

  employerTopUp: {
    underCeilingRate: number;
    overCeilingRate: number;
    typicalDays: number;
  };

  tax: {
    averageMunicipalRate: number;
  };
}
