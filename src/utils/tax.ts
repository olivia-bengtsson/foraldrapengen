// Skatt. Förenklad modell: en platt skattesats på både lön, föräldrapenning och föräldralön.
// Ersätts av en skattemodul för 2026 i Fas 4 (A8).

// A8: ska bli RULES.tax.averageMunicipalRate (32,38 %) när skattemodulen görs.
export const DEFAULT_TAX_RATE = 0.3;

/** Skatt på ett belopp. taxRate är 0–1, t.ex. 0.3 för 30 %. */
export const calculateTax = (
  amount: number,
  taxRate: number = DEFAULT_TAX_RATE
): number => amount * taxRate;

/** Belopp efter skatt. */
export const afterTax = (amount: number, taxRate: number = DEFAULT_TAX_RATE): number =>
  amount * (1 - taxRate);
