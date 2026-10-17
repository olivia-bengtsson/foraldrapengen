import { Parent, ParentBenefits } from "../types";
import { getTotalDaysFromPeriods } from "./periodHelpers";
import { RULES } from "../rules";
import { todayDate } from "./dates";

/**
 * Genererar en textsummering som kan kopieras till urklipp
 * Innehåller all info som behövs för FK-ansökan (utan personnummer)
 */
export const generateCopyText = (
  parents: Parent[],
  parentResults: ParentBenefits[],
  birthDate: string,
  doubleDays: number,
  numParents: 1 | 2
): string => {
  const today = todayDate();

  let text = `FÖRÄLDRAPENNING - MIN PLAN
═══════════════════════════════════════

📅 Skapad: ${today}
👶 Barnets födelsedatum: ${birthDate}
👥 Antal föräldrar: ${numParents}
${numParents === 2 ? `🔄 Dubbeldagar: ${doubleDays}\n` : ""}
═══════════════════════════════════════

`;

  parents.slice(0, numParents).forEach((parent, idx) => {
    const result = parentResults[idx];
    text += `
${parent.name.toUpperCase()}
───────────────────────────────────────
Anställningsform: Anställd
Månadslön: ${parent.monthlySalary.toLocaleString("sv-SE")} kr
Arbetsgivartillägg (PAG): ${parent.employerTopUp}%

PLANERAD LEDIGHET:
• Antal dagar: ${getTotalDaysFromPeriods(parent.periods)} dagar
• Antal perioder: ${parent.periods.length}
${parent.periods.map((p, i) => `  Period ${i + 1}: ${p.startDate} till ${p.endDate} (${p.daysToTake} dagar, ${p.daysPerWeek} d/v)`).join("\n")}
• Ledighet i månader: ${result.monthsNeeded.toFixed(1)} mån

EKONOMI:
• SGI (årsinkomst): ${result.sgi.toLocaleString("sv-SE")} kr/år
• Dagersättning efter skatt: ${result.dailyBenefitAfterTax.toLocaleString("sv-SE")} kr/dag
• Högnivådagar (80%): ${result.highLevelDays} dagar
• Lågnivådagar (${RULES.benefit.lowLevelDaily} kr): ${result.lowLevelDays} dagar
• Total ersättning efter skatt: ${result.totalBenefitAfterTax.toLocaleString("sv-SE")} kr
${parent.employerTopUp > 0 ? `• Arbetsgivartillägg: ${result.employerTopUpAmount.toLocaleString("sv-SE")} kr\n` : ""}
`;
  });

  text += `
═══════════════════════════════════════
TOTALT FÖR FAMILJEN
───────────────────────────────────────
• Använda dagar: ${parents.slice(0, numParents).reduce((sum, p) => sum + getTotalDaysFromPeriods(p.periods), 0)} av ${RULES.days.total}
• Återstående dagar: ${RULES.days.total - parents.slice(0, numParents).reduce((sum, p) => sum + getTotalDaysFromPeriods(p.periods), 0) - doubleDays}
• Total ersättning efter skatt: ${parentResults.reduce((sum, r) => sum + r.totalBenefitAfterTax, 0).toLocaleString("sv-SE")} kr

═══════════════════════════════════════
📋 INFORMATION FÖR FK-ANSÖKAN
───────────────────────────────────────
När du ansöker på Försäkringskassan behöver du:
1. Logga in på: www.forsakringskassan.se
2. Välj "Ansök och planera föräldrapenning"
3. Ange dessa uppgifter för varje period:
   - Startdatum och slutdatum
   - Omfattning (t.ex. 5 dagar/vecka = 71%)
   - Din arbetsgivare
   - Om ni ska vara lediga samtidigt (dubbeldagar)

💡 VIKTIGT ATT KOMMA IHÅG:
• Ansök i god tid (minst 2 veckor innan)
• Anmäl lönehöjningar till FK
• Spara din ansökan som referens
• Uppdatera uppgifter om något ändras
• Ta inte semester samtidigt som föräldrapenning

🔗 Länkar:
• Ansök: https://www.forsakringskassan.se/foralder/foraldrapenning
• Räkna SGI: https://www.forsakringskassan.se/sjuk/berakna-sgi

═══════════════════════════════════════
⚠️  VIKTIG INFORMATION
───────────────────────────────────────
Denna beräkning är vägledande. För exakta belopp,
kontakta Försäkringskassan eller använd deras
officiella beräkningsverktyg.

Data från denna beräkning sparas INTE på servern.
All information finns endast i din webbläsare.

Skapad med Föräldrapengen.se
`;

  return text;
};

/**
 * Kopierar text till urklipp
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

/**
 * Genererar Excel-fil med all data
 * Använder en enkel CSV-format som Excel kan öppna
 */
export const generateExcelExport = (
  parents: Parent[],
  parentResults: ParentBenefits[],
  birthDate: string,
  doubleDays: number,
  numParents: 1 | 2,
  monthlyData: any[]
): void => {
  const today = todayDate();

  // Skapa CSV-innehåll (Excel kan öppna CSV)
  let csv = "\uFEFF"; // BOM för UTF-8

  // Översikt
  csv += "FÖRÄLDRAPENNING - MIN PLAN\n";
  csv += `Skapad:,${today}\n`;
  csv += `Barnets födelsedatum:,${birthDate}\n`;
  csv += `Antal föräldrar:,${numParents}\n`;
  if (numParents === 2) {
    csv += `Dubbeldagar:,${doubleDays}\n`;
  }
  csv += "\n";

  // För varje förälder
  parents.slice(0, numParents).forEach((parent, idx) => {
    const result = parentResults[idx];

    csv += `${parent.name}\n`;
    csv += "Kategori,Värde\n";
    csv += `Anställningsform,Anställd\n`;
    csv += `Månadslön,${parent.monthlySalary}\n`;
    csv += `Arbetsgivartillägg (PAG),${parent.employerTopUp}%\n`;
    csv += `\n`;

    csv += "PLANERAD LEDIGHET\n";
    csv += `Antal dagar totalt,${getTotalDaysFromPeriods(parent.periods)}\n`;
    csv += `Antal perioder,${parent.periods.length}\n`;
    parent.periods.forEach((p, i) => {
      csv += `Period ${i + 1},${p.startDate} till ${p.endDate},${p.daysToTake} dagar,${p.daysPerWeek} d/v\n`;
    });
    csv += `Ledighet i månader,${result.monthsNeeded.toFixed(1)}\n`;
    csv += `\n`;

    csv += "EKONOMI\n";
    csv += `SGI (årsinkomst),${result.sgi.toFixed(0)}\n`;
    csv += `Dagersättning efter skatt,${result.dailyBenefitAfterTax.toFixed(0)}\n`;
    csv += `Högnivådagar (80%),${result.highLevelDays}\n`;
    csv += `Lågnivådagar (${RULES.benefit.lowLevelDaily} kr),${result.lowLevelDays}\n`;
    csv += `Total ersättning efter skatt,${result.totalBenefitAfterTax.toFixed(0)}\n`;
    if (parent.employerTopUp > 0) {
      csv += `Arbetsgivartillägg,${result.employerTopUpAmount.toFixed(0)}\n`;
    }
    csv += `\n`;
  });

  // Totalt
  csv += "TOTALT FÖR FAMILJEN\n";
  const totalDays = parents
    .slice(0, numParents)
    .reduce((sum, p) => sum + getTotalDaysFromPeriods(p.periods), 0);
  const remainingDays = RULES.days.total - totalDays - doubleDays;
  const totalBenefit = parentResults.reduce(
    (sum, r) => sum + r.totalBenefitAfterTax,
    0
  );
  csv += `Använda dagar,${totalDays}\n`;
  csv += `Återstående dagar,${remainingDays}\n`;
  csv += `Total ersättning efter skatt,${totalBenefit.toFixed(0)}\n`;
  csv += `\n`;

  // Månadsinkomst
  csv += "MÅNADSINKOMST\n";
  csv += `Månad,${parents[0].name}`;
  if (numParents === 2) {
    csv += `,${parents[1].name}`;
  }
  csv += `,Totalt\n`;

  monthlyData.forEach((data) => {
    const parent2Total = data.parent2Total ?? 0;
    csv += `${data.month},${data.parent1Total.toFixed(0)}`;
    if (numParents === 2) {
      csv += `,${parent2Total.toFixed(0)}`;
    }
    csv += `,${(data.parent1Total + parent2Total).toFixed(0)}\n`;
  });

  csv += `\n`;
  csv += "VIKTIGT\n";
  csv += "Denna beräkning är vägledande.\n";
  csv += "För exakta belopp kontakta Försäkringskassan.\n";
  csv += "Data sparas INTE på servern.\n";

  // Skapa och ladda ner fil
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `foraldrapenning_${today}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
