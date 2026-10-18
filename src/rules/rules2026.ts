// Regler och belopp för föräldrapenning 2026.
// Alla värden kommer från docs/GRANSKNING-2026.md (avsnitt 1). Uppdatera varje januari.
//
// Källor:
// [FK-belopp]   https://www.forsakringskassan.se/privatperson/e-tjanster-blanketter-och-informationsmaterial/aktuella-belopp
// [FK-fp]       https://www.forsakringskassan.se/privatperson/familj-och-barn/foraldrapenning
// [FK-dubbel]   https://www.forsakringskassan.se/privatperson/familj-och-barn/foraldrapenning/foraldralediga-tillsammans-dubbeldagar
// [FK-överföra] https://www.forsakringskassan.se/privatperson/familj-och-barn/foraldrapenning/fora-over-eller-ta-tillbaka-dagar-med-foraldrapenning
// [SCB-pbb]     https://scb.se/hitta-statistik/statistik-efter-amne/priser-och-ekonomiska-tendenser/priser/konsumentprisindex-kpi/pong/statistiknyhet/prisbasbeloppet-for-ar-2026
// [Ekonomifakta] https://www.ekonomifakta.se/sakomraden/skatt/din-skatt-ar-2026_1246309.html
// [Handelsbanken] https://www.handelsbanken.se/sv/ekonomi-i-livet/privatekonomi/livssituationer/familjeliv/foraldralon

import { ParentalBenefitRules } from "./types";

const PRICE_BASE_AMOUNT = 59200; // [SCB-pbb]
const SGI_MAX = 592000; // 10 prisbasbelopp [FK-belopp]

export const RULES_2026: ParentalBenefitRules = {
  year: 2026,
  priceBaseAmount: PRICE_BASE_AMOUNT,

  sgi: {
    max: SGI_MAX,
    maxMonthly: SGI_MAX / 12, // ca 49 333 kr/mån
    min: 14200, // 24 % av prisbasbeloppet [FK-belopp]
    // Krav för sjukpenningnivå de första 180 dagarna: SGI motsvarande minst
    // 7 083 kr/mån i minst 240 dagar före födseln, annars lägre ersättning [FK-fp]
    highLevelRequirement: {
      minMonthlyIncome: 7083,
      daysBeforeBirth: 240,
      appliesToFirstDays: 180,
    },
  },

  benefit: {
    // dagersättning = round(SGI × 0,97 × 0,80 / 365), inom basicDaily–maxDaily
    sgiFactor: 0.97,
    rate: 0.8,
    maxDaily: 1259, // sjukpenningnivå, högsta [FK-belopp]
    basicDaily: 250, // sjukpenningnivå, lägsta (grundnivå) [FK-belopp]
    lowLevelDaily: 180, // lägstanivå [FK-belopp]
  },

  days: {
    total: 480, // [FK-fp]
    perParent: 240,
    highLevelTotal: 390,
    lowLevelTotal: 90,
    highLevelPerParent: 195,
    lowLevelPerParent: 45,
    reservedPerParent: 90, // på sjukpenningnivå, kan inte föras över [FK-fp]
    transferablePerParent: 150, // 240 − 90, till den andra föräldern
    transferToOtherInsuredMax: 45, // per förälder, t.ex. till mor/farförälder, inte reserverade dagar [FK-överföra]
    highLevelBeforeLowLevel: 180, // lägstanivådagar först efter 180 sjukpenningdagar [FK-dubbel]
    maxDoubleDays: 60, // [FK-dubbel]
    doubleDaysMaxAgeMonths: 15, // [FK-dubbel]
    maxSavedDaysAfterAge4: 96, // [FK-fp]
    lastAgeYears: 12, // eller slutet av årskurs 5 [FK-fp]
  },

  // Föräldralön via kollektivavtal, vanliga villkor [Handelsbanken]
  employerTopUp: {
    underCeilingRate: 0.1,
    overCeilingRate: 0.9,
    typicalDays: 180, // sammanlagda kalenderdagar på sjukpenningnivå, oftast upp till 6 månader
  },

  tax: {
    averageMunicipalRate: 0.3238, // snitt kommunalskatt 2026 [Ekonomifakta]
  },
};
