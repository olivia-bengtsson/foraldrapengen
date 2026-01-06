// Kommunalskatt per kommun i Sverige för 2025
// Data från SCB (Statistiska centralbyrån)

export interface Municipality {
  name: string;
  county: string;
  totalTax: number; // Total kommunalskatt (kommun + region)
  municipalTax: number; // Endast kommunskatt
  regionalTax: number; // Endast regionskatt
}

// Genomsnitt och min/max för 2025
export const TAX_STATS_2025 = {
  average: 32.41,
  lowest: 28.98, // Österåker
  highest: 35.3, // Degerfors
};

// Lista med de största kommunerna i Sverige
export const MAJOR_MUNICIPALITIES: Municipality[] = [
  // Stockholm län
  {
    name: "Stockholm",
    county: "Stockholm",
    totalTax: 30.6,
    municipalTax: 18.09,
    regionalTax: 12.51,
  },
  {
    name: "Huddinge",
    county: "Stockholm",
    totalTax: 30.33,
    municipalTax: 17.82,
    regionalTax: 12.51,
  },
  {
    name: "Sollentuna",
    county: "Stockholm",
    totalTax: 29.83,
    municipalTax: 17.32,
    regionalTax: 12.51,
  },
  {
    name: "Södertälje",
    county: "Stockholm",
    totalTax: 31.07,
    municipalTax: 18.56,
    regionalTax: 12.51,
  },
  {
    name: "Järfälla",
    county: "Stockholm",
    totalTax: 30.19,
    municipalTax: 17.68,
    regionalTax: 12.51,
  },
  {
    name: "Botkyrka",
    county: "Stockholm",
    totalTax: 31.12,
    municipalTax: 18.61,
    regionalTax: 12.51,
  },
  {
    name: "Haninge",
    county: "Stockholm",
    totalTax: 31.05,
    municipalTax: 18.54,
    regionalTax: 12.51,
  },
  {
    name: "Tyresö",
    county: "Stockholm",
    totalTax: 29.84,
    municipalTax: 17.33,
    regionalTax: 12.51,
  },
  {
    name: "Österåker",
    county: "Stockholm",
    totalTax: 28.98,
    municipalTax: 16.47,
    regionalTax: 12.51,
  },
  {
    name: "Nacka",
    county: "Stockholm",
    totalTax: 29.82,
    municipalTax: 17.31,
    regionalTax: 12.51,
  },
  {
    name: "Lidingö",
    county: "Stockholm",
    totalTax: 29.52,
    municipalTax: 17.01,
    regionalTax: 12.51,
  },
  {
    name: "Solna",
    county: "Stockholm",
    totalTax: 29.51,
    municipalTax: 17.0,
    regionalTax: 12.51,
  },
  {
    name: "Sundbyberg",
    county: "Stockholm",
    totalTax: 29.51,
    municipalTax: 17.0,
    regionalTax: 12.51,
  },
  {
    name: "Danderyd",
    county: "Stockholm",
    totalTax: 29.48,
    municipalTax: 16.97,
    regionalTax: 12.51,
  },
  {
    name: "Ekerö",
    county: "Stockholm",
    totalTax: 30.06,
    municipalTax: 17.55,
    regionalTax: 12.51,
  },
  {
    name: "Upplands Väsby",
    county: "Stockholm",
    totalTax: 30.2,
    municipalTax: 17.69,
    regionalTax: 12.51,
  },
  {
    name: "Täby",
    county: "Stockholm",
    totalTax: 29.52,
    municipalTax: 17.01,
    regionalTax: 12.51,
  },
  {
    name: "Vallentuna",
    county: "Stockholm",
    totalTax: 29.86,
    municipalTax: 17.35,
    regionalTax: 12.51,
  },
  {
    name: "Sigtuna",
    county: "Stockholm",
    totalTax: 30.47,
    municipalTax: 17.96,
    regionalTax: 12.51,
  },
  {
    name: "Nynäshamn",
    county: "Stockholm",
    totalTax: 31.28,
    municipalTax: 18.77,
    regionalTax: 12.51,
  },

  // Västra Götaland
  {
    name: "Göteborg",
    county: "Västra Götaland",
    totalTax: 32.15,
    municipalTax: 21.12,
    regionalTax: 11.03,
  },
  {
    name: "Mölndal",
    county: "Västra Götaland",
    totalTax: 32.04,
    municipalTax: 21.01,
    regionalTax: 11.03,
  },
  {
    name: "Partille",
    county: "Västra Götaland",
    totalTax: 31.52,
    municipalTax: 20.49,
    regionalTax: 11.03,
  },
  {
    name: "Kungälv",
    county: "Västra Götaland",
    totalTax: 31.88,
    municipalTax: 20.85,
    regionalTax: 11.03,
  },
  {
    name: "Ale",
    county: "Västra Götaland",
    totalTax: 32.02,
    municipalTax: 20.99,
    regionalTax: 11.03,
  },
  {
    name: "Lerum",
    county: "Västra Götaland",
    totalTax: 31.68,
    municipalTax: 20.65,
    regionalTax: 11.03,
  },
  {
    name: "Härryda",
    county: "Västra Götaland",
    totalTax: 31.68,
    municipalTax: 20.65,
    regionalTax: 11.03,
  },
  {
    name: "Borås",
    county: "Västra Götaland",
    totalTax: 32.52,
    municipalTax: 21.49,
    regionalTax: 11.03,
  },
  {
    name: "Trollhättan",
    county: "Västra Götaland",
    totalTax: 33.05,
    municipalTax: 22.02,
    regionalTax: 11.03,
  },
  {
    name: "Uddevalla",
    county: "Västra Götaland",
    totalTax: 32.87,
    municipalTax: 21.84,
    regionalTax: 11.03,
  },

  // Skåne
  {
    name: "Malmö",
    county: "Skåne",
    totalTax: 32.42,
    municipalTax: 21.09,
    regionalTax: 11.33,
  },
  {
    name: "Lund",
    county: "Skåne",
    totalTax: 32.17,
    municipalTax: 20.84,
    regionalTax: 11.33,
  },
  {
    name: "Helsingborg",
    county: "Skåne",
    totalTax: 32.28,
    municipalTax: 20.95,
    regionalTax: 11.33,
  },
  {
    name: "Trelleborg",
    county: "Skåne",
    totalTax: 32.73,
    municipalTax: 21.4,
    regionalTax: 11.33,
  },
  {
    name: "Kristianstad",
    county: "Skåne",
    totalTax: 32.74,
    municipalTax: 21.41,
    regionalTax: 11.33,
  },
  {
    name: "Landskrona",
    county: "Skåne",
    totalTax: 32.86,
    municipalTax: 21.53,
    regionalTax: 11.33,
  },
  {
    name: "Ängelholm",
    county: "Skåne",
    totalTax: 32.37,
    municipalTax: 21.04,
    regionalTax: 11.33,
  },
  {
    name: "Eslöv",
    county: "Skåne",
    totalTax: 32.7,
    municipalTax: 21.37,
    regionalTax: 11.33,
  },
  {
    name: "Ystad",
    county: "Skåne",
    totalTax: 32.84,
    municipalTax: 21.51,
    regionalTax: 11.33,
  },
  {
    name: "Hässleholm",
    county: "Skåne",
    totalTax: 32.83,
    municipalTax: 21.5,
    regionalTax: 11.33,
  },
  {
    name: "Burlöv",
    county: "Skåne",
    totalTax: 32.33,
    municipalTax: 21.0,
    regionalTax: 11.33,
  },
  {
    name: "Lomma",
    county: "Skåne",
    totalTax: 31.71,
    municipalTax: 20.38,
    regionalTax: 11.33,
  },
  {
    name: "Staffanstorp",
    county: "Skåne",
    totalTax: 31.87,
    municipalTax: 20.54,
    regionalTax: 11.33,
  },
  {
    name: "Vellinge",
    county: "Skåne",
    totalTax: 31.29,
    municipalTax: 19.96,
    regionalTax: 11.33,
  },
  {
    name: "Kävlinge",
    county: "Skåne",
    totalTax: 31.88,
    municipalTax: 20.55,
    regionalTax: 11.33,
  },

  // Uppsala län
  {
    name: "Uppsala",
    county: "Uppsala",
    totalTax: 32.01,
    municipalTax: 20.77,
    regionalTax: 11.24,
  },
  {
    name: "Enköping",
    county: "Uppsala",
    totalTax: 32.65,
    municipalTax: 21.41,
    regionalTax: 11.24,
  },
  {
    name: "Sigtuna",
    county: "Uppsala",
    totalTax: 30.47,
    municipalTax: 17.96,
    regionalTax: 12.51,
  },

  // Östergötland
  {
    name: "Linköping",
    county: "Östergötland",
    totalTax: 32.8,
    municipalTax: 21.42,
    regionalTax: 11.38,
  },
  {
    name: "Norrköping",
    county: "Östergötland",
    totalTax: 32.86,
    municipalTax: 21.48,
    regionalTax: 11.38,
  },
  {
    name: "Motala",
    county: "Östergötland",
    totalTax: 33.22,
    municipalTax: 21.84,
    regionalTax: 11.38,
  },

  // Örebro län
  {
    name: "Örebro",
    county: "Örebro",
    totalTax: 32.85,
    municipalTax: 21.36,
    regionalTax: 11.49,
  },
  {
    name: "Karlskoga",
    county: "Örebro",
    totalTax: 33.76,
    municipalTax: 22.27,
    regionalTax: 11.49,
  },
  {
    name: "Kumla",
    county: "Örebro",
    totalTax: 32.79,
    municipalTax: 21.3,
    regionalTax: 11.49,
  },

  // Värmland
  {
    name: "Karlstad",
    county: "Värmland",
    totalTax: 33.33,
    municipalTax: 21.78,
    regionalTax: 11.55,
  },
  {
    name: "Kristinehamn",
    county: "Värmland",
    totalTax: 33.71,
    municipalTax: 22.16,
    regionalTax: 11.55,
  },
  {
    name: "Arvika",
    county: "Värmland",
    totalTax: 33.91,
    municipalTax: 22.36,
    regionalTax: 11.55,
  },

  // Jönköping
  {
    name: "Jönköping",
    county: "Jönköping",
    totalTax: 32.78,
    municipalTax: 21.6,
    regionalTax: 11.18,
  },
  {
    name: "Värnamo",
    county: "Jönköping",
    totalTax: 32.78,
    municipalTax: 21.6,
    regionalTax: 11.18,
  },

  // Halland
  {
    name: "Halmstad",
    county: "Halland",
    totalTax: 32.5,
    municipalTax: 21.39,
    regionalTax: 11.11,
  },
  {
    name: "Varberg",
    county: "Halland",
    totalTax: 31.97,
    municipalTax: 20.86,
    regionalTax: 11.11,
  },
  {
    name: "Kungsbacka",
    county: "Halland",
    totalTax: 31.32,
    municipalTax: 20.21,
    regionalTax: 11.11,
  },

  // Västmanland
  {
    name: "Västerås",
    county: "Västmanland",
    totalTax: 32.69,
    municipalTax: 21.51,
    regionalTax: 11.18,
  },
  {
    name: "Eskilstuna",
    county: "Södermanland",
    totalTax: 32.68,
    municipalTax: 21.71,
    regionalTax: 10.97,
  },

  // Gävleborg
  {
    name: "Gävle",
    county: "Gävleborg",
    totalTax: 33.42,
    municipalTax: 22.26,
    regionalTax: 11.16,
  },
  {
    name: "Sandviken",
    county: "Gävleborg",
    totalTax: 33.75,
    municipalTax: 22.59,
    regionalTax: 11.16,
  },

  // Dalarna
  {
    name: "Falun",
    county: "Dalarna",
    totalTax: 33.71,
    municipalTax: 22.06,
    regionalTax: 11.65,
  },
  {
    name: "Borlänge",
    county: "Dalarna",
    totalTax: 33.96,
    municipalTax: 22.31,
    regionalTax: 11.65,
  },

  // Västernorrland
  {
    name: "Sundsvall",
    county: "Västernorrland",
    totalTax: 33.89,
    municipalTax: 22.13,
    regionalTax: 11.76,
  },
  {
    name: "Örnsköldsvik",
    county: "Västernorrland",
    totalTax: 33.91,
    municipalTax: 22.15,
    regionalTax: 11.76,
  },

  // Västerbotten
  {
    name: "Umeå",
    county: "Västerbotten",
    totalTax: 33.89,
    municipalTax: 22.08,
    regionalTax: 11.81,
  },
  {
    name: "Skellefteå",
    county: "Västerbotten",
    totalTax: 33.96,
    municipalTax: 22.15,
    regionalTax: 11.81,
  },

  // Norrbotten
  {
    name: "Luleå",
    county: "Norrbotten",
    totalTax: 33.81,
    municipalTax: 22.1,
    regionalTax: 11.71,
  },
  {
    name: "Piteå",
    county: "Norrbotten",
    totalTax: 33.83,
    municipalTax: 22.12,
    regionalTax: 11.71,
  },
];

// Extremvärden för 2025
export const EXTREME_MUNICIPALITIES = {
  lowest: { name: "Österåker", county: "Stockholm", totalTax: 28.98 },
  highest: { name: "Degerfors", county: "Örebro", totalTax: 35.3 },
};

/**
 * Hitta kommun baserat på namn
 */
export const findMunicipality = (name: string): Municipality | undefined => {
  return MAJOR_MUNICIPALITIES.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Hämta alla kommuner för ett län
 */
export const getMunicipalitiesByCounty = (county: string): Municipality[] => {
  return MAJOR_MUNICIPALITIES.filter((m) => m.county === county);
};

/**
 * Hämta alla unika län
 */
export const getUniqueCounties = (): string[] => {
  return Array.from(new Set(MAJOR_MUNICIPALITIES.map((m) => m.county))).sort();
};

/**
 * Beräkna skatt för sidoinkomst (t.ex. föräldrapenning)
 * För föräldrapenning som sidoinkomst dras vanligen 30% standardskatt
 * Men den verkliga skatten kan vara högre/lägre beroende på din totala inkomst
 */
export const calculateTaxRate = (
  municipalityName?: string,
  isChurchMember: boolean = false
): number => {
  if (!municipalityName) {
    // Använd standardskatt 30% om ingen kommun angiven
    return 0.3;
  }

  const municipality = findMunicipality(municipalityName);

  if (!municipality) {
    // Om kommunen inte hittas, använd genomsnitt
    return TAX_STATS_2025.average / 100;
  }

  // Kommunalskatt + kyrkoavgift (ca 1% om medlem)
  const churchTax = isChurchMember ? 0.01 : 0;

  return municipality.totalTax / 100 + churchTax;
};
