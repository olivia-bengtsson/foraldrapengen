// Gällande regler. Byt till nästa års fil här vid årsskiftet.
import { RULES_2026 } from "./rules2026";

export type { ParentalBenefitRules } from "./types";
export const RULES = RULES_2026;

/** Föräldralön från arbetsgivaren med vanliga avtalsvillkor (A9) */
export const DEFAULT_TOP_UP = {
  topUpUnderCeilingPercent: Math.round(RULES.employerTopUp.underCeilingRate * 100),
  topUpOverCeilingPercent: Math.round(RULES.employerTopUp.overCeilingRate * 100),
  topUpDays: RULES.employerTopUp.typicalDays,
};
