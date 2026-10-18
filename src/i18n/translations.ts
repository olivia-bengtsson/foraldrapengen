// Translations for the app

export type Language = "sv" | "en";

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;

  // Tabs
  calculatorTab: string;
  examplesTab: string;

  // Settings
  settingsTitle: string;
  numParentsLabel: string;
  birthDateLabel: string;
  doubleDaysLabel: string;

  // Parent card
  parentLabel: string;
  monthlySalaryLabel: string;
  employerTopUpLabel: string;
  topUpUnderCeilingLabel: string;
  topUpOverCeilingLabel: string;
  topUpDaysLabel: string;
  topUpHint: string;
  daysToTakeLabel: string;
  daysPerWeekLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  endDateCalculated: string;

  // Results
  sgiLabel: string;
  dailyBenefitAfterTaxLabel: string;
  leaveLabel: string;
  monthsLabel: string;
  highLevelDaysLabel: string;
  daysLabel: string;
  totalBenefitAfterTaxLabel: string;

  // Days summary
  totalUsedDays: string;
  remainingDays: string;

  // Monthly table
  monthlyIncomeTitle: string;
  monthlyIncomeSubtitle: string;
  monthLabel: string;
  parent1Label: string;
  parent2Label: string;
  totalLabel: string;

  // Summary
  summaryTitle: string;
  totalBenefitLabel: string;
  beforeTaxLabel: string;

  // Export
  exportTitle: string;
  exportSubtitle: string;
  copyToClipboard: string;
  copied: string;
  downloadExcel: string;
  exportIncludesLabel: string;
  exportIncludesText: string;
  privacyLabel: string;
  privacyText: string;

  // Info tooltips
  numParentsTooltipTitle: string;
  numParentsTooltipContent: string;
  birthDateTooltipTitle: string;
  birthDateTooltipContent: string;
  doubleDaysTooltipTitle: string;
  doubleDaysTooltipContent: string;
  salaryTooltipTitle: string;
  salaryTooltipContent: string;
  pagTooltipTitle: string;
  pagTooltipContent: string;
  daysToTakeTooltipTitle: string;
  daysToTakeTooltipContent: string;
  daysPerWeekTooltipTitle: string;
  daysPerWeekTooltipContent: string;
  startDateTooltipTitle: string;
  startDateTooltipContent: string;
  readMoreFK: string;

  // Info cards
  infoGuideTitle: string;
  infoCard1Title: string;
  infoCard1Content: string;
  infoCard2Title: string;
  infoCard2Content: string;
  infoCard3Title: string;
  infoCard3Content: string;
  infoCard4Title: string;
  infoCard4Content: string;
  infoCard5Title: string;
  infoCard5Content: string;
  infoCard6Title: string;
  infoCard6Content: string;
  infoCard7Title: string;
  infoCard7Content: string;
  infoCard8Title: string;
  infoCard8Content: string;

  // Period card
  periodWeeksLabel: string;
  periodApproxMonths: string; // {months}
  periodSummary: string; // {start} {end} {weeks} {days}
  worksOtherDaysQuestion: string;
  worksOtherDaysNo: string;
  worksOtherDaysYes: string;
  worksOtherDaysHelpNo: string; // {days}
  worksOtherDaysHelpYes: string; // {days}

  // Planner (Fas 3)
  plannerNote: string;
  plannerBackToOld: string;
  plannerFormLabel: string;
  plannerPlanLabel: string;
  plannerTabsLabel: string;
  plannerTabQuick: string;
  plannerTabDetailed: string;
  plannerComingSoon: string;
  plannerPlanHeading: string;

  // Quick start
  qsPresetsLabel: string;
  qsPresetEqual: string;
  qsPresetLongest: string;
  qsPresetMoreMoney: string;
  qsNumParents: string;
  qsOneParent: string;
  qsTwoParents: string;
  qsBirthDate: string;
  qsFirst: string;
  qsMonths: string;
  qsMonthsValue: string;
  qsMonthsNone: string;
  qsDaysPerWeek: string;
  qsDaysOption: string;
  qsDaysPerWeekHint: string;
  qsTogether: string;
  qsTogetherNo: string;
  qsTogetherWeeks: string;
  qsTogetherHint: string;
  qsSalary: string;
  qsTopUp: string;
  qsOverwriteNotice: string;
  qsOverwriteApply: string;
  qsToDetailed: string;

  // Footer
  disclaimerText: string;
  privacyFooterText: string;
}

/** Locale för datum och tal per språk */
export const locales: Record<Language, string> = { sv: "sv-SE", en: "en-GB" };

/** Ersätter {nyckel} i en översättning med värden. */
export const interpolate = (
  template: string,
  values: Record<string, string | number>
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );

export const translations: Record<Language, Translations> = {
  sv: {
    // Header
    appTitle: "Föräldrapengen",
    appSubtitle: "Planera och beräkna er föräldraledighet",

    // Tabs
    calculatorTab: "Kalkylator",
    examplesTab: "Exempel",

    // Settings
    settingsTitle: "Grundinställningar",
    numParentsLabel: "Antal föräldrar",
    birthDateLabel: "Barnets födelsedatum",
    doubleDaysLabel: "Dubbeldagar (max 60)",

    // Parent card
    parentLabel: "Förälder",
    monthlySalaryLabel: "Månadslön (kr)",
    employerTopUpLabel: "Föräldralön från arbetsgivaren",
    topUpUnderCeilingLabel: "Under taket (%)",
    topUpOverCeilingLabel: "Över taket (%)",
    topUpDaysLabel: "Antal dagar",
    topUpHint:
      "Vanligt är ca 10 % av lönen och ca 90 % av lönedelen över 49 333 kr/mån, i upp till 6 månader. Räknas i kalenderdagar på sjukpenningnivå. Kolla ditt kollektivavtal!",
    daysToTakeLabel: "Antal dagar att ta ut",
    daysPerWeekLabel: "Dagar per vecka",
    startDateLabel: "Startdatum",
    endDateLabel: "Slutdatum",
    endDateCalculated: "Slutdatum (beräknat)",

    // Results
    sgiLabel: "SGI",
    dailyBenefitAfterTaxLabel: "Dagersättning efter skatt",
    leaveLabel: "Ledighet",
    monthsLabel: "månader",
    highLevelDaysLabel: "Högnivådagar",
    daysLabel: "dagar",
    totalBenefitAfterTaxLabel: "Total ersättning under ledighet efter skatt",

    // Days summary
    totalUsedDays: "Totalt använda dagar",
    remainingDays: "Återstående dagar",

    // Monthly table
    monthlyIncomeTitle:
      "Månadsinkomst över tid - Lön och Föräldrapenning efter skatt",
    monthlyIncomeSubtitle:
      "När en förälder är ledig visas föräldrapenning. När en förälder jobbar visas normal lön cirka 70% efter skatt.",
    monthLabel: "Månad",
    parent1Label: "Förälder 1",
    parent2Label: "Förälder 2",
    totalLabel: "Totalt",

    // Summary
    summaryTitle: "Sammanfattning",
    totalBenefitLabel: "Total ersättning under ledighet efter skatt",
    beforeTaxLabel: "Före skatt",

    // Export
    exportTitle: "Spara din plan",
    exportSubtitle:
      "Exportera din beräkning för att enkelt kunna fylla i på Försäkringskassans hemsida. All data du behöver finns med (utom personnummer).",
    copyToClipboard: "Kopiera till urklipp",
    copied: "Kopierat!",
    downloadExcel: "Ladda ner Excel",
    exportIncludesLabel: "📋 Vad ingår:",
    exportIncludesText:
      "Alla dina inmatningar, beräknade ersättningar, månadsinkomst och länkar till FK. Du kan klistra in detta i dina anteckningar eller öppna Excel-filen.",
    privacyLabel: "🔒 Integritet:",
    privacyText:
      "All data hanteras lokalt i din webbläsare. Inget sparas på servern.",

    // Info tooltips
    numParentsTooltipTitle: "Antal föräldrar",
    numParentsTooltipContent:
      "Välj om det är en eller två föräldrar som ska dela på föräldraledigheten. Vid ensamförälder får du ta ut alla 480 dagar själv.",
    birthDateTooltipTitle: "Barnets födelsedatum",
    birthDateTooltipContent:
      "Välj barnets planerade eller faktiska födelsedatum. Detta används för att beräkna när ni kan börja ta ut föräldrapenning.",
    doubleDaysTooltipTitle: "Dubbeldagar",
    doubleDaysTooltipContent:
      "Under barnets första 15 månader kan båda föräldrarna vara lediga samtidigt i upp till 60 dagar. När ni tar ut en dubbeldag räknas två dagar av, en för varje förälder. Om ni tar ut alla 60 dubbeldagarna har ni alltså utnyttjat 120 dagar med föräldrapenning från era totala 480 dagar. Du kan inte ta ut dubbeldagar från dina 90 reserverade dagar.",
    salaryTooltipTitle: "Månadslön",
    salaryTooltipContent:
      "Ange din månadslön före skatt. Detta används för att beräkna din SGI (sjukpenninggrundande inkomst). Medellönen i Sverige är ca 37 000 kr/månad (2024). Om du har oregelbundna inkomster, använd ett genomsnitt av de senaste 12 månaderna.",
    pagTooltipTitle: "Föräldralön från arbetsgivaren",
    pagTooltipContent:
      "Med kollektivavtal får du ofta föräldralön från arbetsgivaren utöver föräldrapenningen: ca 10 % av lönen och ca 90 % av lönedelen över 49 333 kr/mån, oftast i upp till 6 månader. Villkor och krav på anställningstid varierar. Fråga din arbetsgivare eller ditt fackförbund vad som gäller för dig.",
    daysToTakeTooltipTitle: "Antal dagar",
    daysToTakeTooltipContent:
      "Ni har totalt 480 dagar att dela mellan er. Varje förälder har 90 reserverade dagar som inte kan överlåtas. Vanligast är att dela lika (240 dagar vardera), men ni kan dela upp dagarna hur ni vill. Tänk på att 390 dagar ger högre ersättning (högnivå) medan resterande 90 dagar ger lägre ersättning (180 kr/dag).",
    daysPerWeekTooltipTitle: "Dagar per vecka",
    daysPerWeekTooltipContent:
      "Du kan välja mellan 1-7 dagar per vecka. Vanligast är 5 dagar/vecka (som en normal arbetsvecka). Färre dagar = längre kalendertid men lägre månadsinkomst. Fler dagar = kortare kalendertid men högre månadsinkomst. 6-7 dagar/vecka är vanligt de första månaderna, sedan 5 dagar/vecka.",
    startDateTooltipTitle: "Startdatum",
    startDateTooltipContent:
      "När vill du börja ta ut föräldrapenning? Du kan ta ut från och med barnets födelse. Många väljer att starta direkt efter förlossningen, men du kan också vänta. Tänk på att koordinera med den andra föräldern så att ni inte har luckor där ingen är hemma.",
    readMoreFK: "Läs mer på Försäkringskassan →",

    // Info cards
    infoGuideTitle: "Snabbguide",
    infoCard1Title: "SGI - Sjukpenninggrundande inkomst",
    infoCard1Content:
      "SGI är din årsinkomst av arbete, högst 592 000 kr (2026). Föräldrapenningen blir ca 80 % av SGI, högst 1 259 kr/dag.",
    infoCard2Title: "Reserverade dagar",
    infoCard2Content:
      "90 dagar per förälder är reserverade och kan inte överföras. Detta uppmuntrar båda att ta ledigt. Övriga 300 dagar kan ni dela fritt.",
    infoCard3Title: "Högnivå och lågnivå",
    infoCard3Content:
      "De första 390 dagarna får du 80% av din SGI (högnivå). Resterande 90 dagar ger 180 kr/dag (lågnivå). Använd högnivådagarna när barnet är litet!",
    infoCard4Title: "Föräldralön från arbetsgivaren",
    infoCard4Content:
      "Med kollektivavtal får du ofta ca 10 % av lönen och ca 90 % av lönedelen över 49 333 kr/mån, oftast i upp till 6 månader. Kolla med din arbetsgivare!",
    infoCard5Title: "Dubbeldagar",
    infoCard5Content:
      "Under barnets första 15 månader kan ni vara lediga samtidigt upp till 60 dagar. När ni tar ut en dubbeldag räknas två dagar av. 60 dubbeldagar = 120 dagar från era 480.",
    infoCard6Title: "Skatt och pension",
    infoCard6Content:
      "Föräldrapenning är både skattepliktig och pensionsgrundande. Du betalar skatt (ca 25-30%) men tjänar även in pension under föräldraledigheten.",
    infoCard7Title: "Så ansöker du",
    infoCard7Content:
      "Ansök på FK:s e-tjänst 'Ansök och planera föräldrapenning'. Du behöver ange datum, omfattning och arbetsgivare. Glöm inte anmäla lönehöjningar!",
    infoCard8Title: "Skydda din SGI",
    infoCard8Content:
      "Under föräldraledighet behålls din SGI automatiskt. Jobbar du deltid och tar semester kan SGI sjunka. Undvik semester när du kombinerar arbete och föräldrapenning.",

    // Period card
    periodWeeksLabel: "Längd (veckor)",
    periodApproxMonths: "≈ {months} mån",
    periodSummary: "{start} – {end} · {weeks} veckor · {days} dagar",
    worksOtherDaysQuestion: "Jobbar du de andra dagarna?",
    worksOtherDaysNo: "Nej",
    worksOtherDaysYes: "Ja",
    worksOtherDaysHelpNo:
      "Du är ledig hela veckan men tar bara ut föräldrapenning {days} dagar. De andra dagarna är obetalda.",
    worksOtherDaysHelpYes: "Du får lön för {days} arbetsdagar i veckan.",

    // Planner
    plannerNote: "Ny planerare – under utveckling",
    plannerBackToOld: "Till gamla vyn",
    plannerFormLabel: "Fyll i",
    plannerPlanLabel: "Er plan",
    plannerTabsLabel: "Sätt att planera",
    plannerTabQuick: "Snabbstart",
    plannerTabDetailed: "Detaljerad plan",
    plannerComingSoon: "Den här delen byggs i nästa steg.",
    plannerPlanHeading: "Er plan",

    // Quick start
    qsPresetsLabel: "Snabbval",
    qsPresetEqual: "Dela lika",
    qsPresetLongest: "Så länge som möjligt",
    qsPresetMoreMoney: "Mer pengar per månad",
    qsNumParents: "Hur många föräldrar delar på dagarna?",
    qsOneParent: "1 förälder",
    qsTwoParents: "2 föräldrar",
    qsBirthDate: "När är barnet fött eller beräknat?",
    qsFirst: "Vem är hemma först?",
    qsMonths: "Hur länge vill ni vara hemma?",
    qsMonthsValue: "{months} mån · {days} dagar",
    qsMonthsNone: "inte hemma",
    qsDaysPerWeek: "Hur många dagar i veckan tar ni ut?",
    qsDaysOption: "{days} dagar",
    qsDaysPerWeekHint: "5 dagar = helt ledig, helgerna sparas.",
    qsTogether: "Vill ni vara hemma tillsammans i början?",
    qsTogetherNo: "Nej",
    qsTogetherWeeks: "{weeks} veckor",
    qsTogetherHint: "Den som inte födde barnet har dessutom 10 dagar i samband med födseln. De är en egen ersättning och tas inte från de 480 dagarna.",
    qsSalary: "Lön per månad före skatt",
    qsTopUp: "{name} får föräldralön från arbetsgivaren (kollektivavtal)",
    qsOverwriteNotice: "Du har ändrat perioderna i Detaljerad plan. Förslaget från Snabbstart skriver över dem.",
    qsOverwriteApply: "Använd förslaget",
    qsToDetailed: "Finjustera perioderna →",

    // Footer
    disclaimerText:
      "Beräkningarna är vägledande. Kontakta Försäkringskassan för exakta uppgifter.",
    privacyFooterText: "Data sparas inte och lämnar aldrig din webbläsare.",
  },

  en: {
    // Header
    appTitle: "Parental Benefit",
    appSubtitle: "Plan and calculate your parental leave",

    // Tabs
    calculatorTab: "Calculator",
    examplesTab: "Examples",

    // Settings
    settingsTitle: "Basic Settings",
    numParentsLabel: "Number of parents",
    birthDateLabel: "Child's birth date",
    doubleDaysLabel: "Double days (max 60)",

    // Parent card
    parentLabel: "Parent",
    monthlySalaryLabel: "Monthly Salary (SEK)",
    employerTopUpLabel: "Parental pay from your employer",
    topUpUnderCeilingLabel: "Below the cap (%)",
    topUpOverCeilingLabel: "Above the cap (%)",
    topUpDaysLabel: "Number of days",
    topUpHint:
      "Common is about 10% of salary and about 90% of the part above 49,333 SEK/month, for up to 6 months. Counted in calendar days at sickness benefit level. Check your collective agreement!",
    daysToTakeLabel: "Days to take",
    daysPerWeekLabel: "Days per week",
    startDateLabel: "Start date",
    endDateLabel: "End date",
    endDateCalculated: "End date (calculated)",

    // Results
    sgiLabel: "SGI",
    dailyBenefitAfterTaxLabel: "Daily benefit after tax",
    leaveLabel: "Leave",
    monthsLabel: "months",
    highLevelDaysLabel: "High-level days",
    daysLabel: "days",
    totalBenefitAfterTaxLabel: "Total benefit during leave after tax",

    // Days summary
    totalUsedDays: "Total used days",
    remainingDays: "Remaining days",

    // Monthly table
    monthlyIncomeTitle:
      "Monthly Income Over Time - Salary and Parental Benefit after tax",
    monthlyIncomeSubtitle:
      "When a parent is on leave, parental benefit is shown. When a parent works, normal salary approximately 70% after tax is shown.",
    monthLabel: "Month",
    parent1Label: "Parent 1",
    parent2Label: "Parent 2",
    totalLabel: "Total",

    // Summary
    summaryTitle: "Summary",
    totalBenefitLabel: "Total benefit during leave after tax",
    beforeTaxLabel: "Before tax",

    // Export
    exportTitle: "Save your plan",
    exportSubtitle:
      "Export your calculation to easily fill in on the Swedish Social Insurance Agency's website. All data you need is included (except personal ID number).",
    copyToClipboard: "Copy to clipboard",
    copied: "Copied!",
    downloadExcel: "Download Excel",
    exportIncludesLabel: "📋 What's included:",
    exportIncludesText:
      "All your inputs, calculated benefits, monthly income and links to the Social Insurance Agency. You can paste this in your notes or open the Excel file.",
    privacyLabel: "🔒 Privacy:",
    privacyText:
      "All data is handled locally in your browser. Nothing is saved on the server.",

    // Info tooltips
    numParentsTooltipTitle: "Number of parents",
    numParentsTooltipContent:
      "Choose if one or two parents will share the parental leave. Single parents can take all 480 days.",
    birthDateTooltipTitle: "Child's birth date",
    birthDateTooltipContent:
      "Choose the child's planned or actual birth date. This is used to calculate when you can start taking parental benefit.",
    doubleDaysTooltipTitle: "Double days",
    doubleDaysTooltipContent:
      "During the child's first 15 months, both parents can be on leave simultaneously for up to 60 days. When you take a double day, two days are counted, one for each parent. If you take all 60 double days, you have used 120 days of parental benefit from your total 480 days. You cannot take double days from your 90 reserved days.",
    salaryTooltipTitle: "Monthly Salary",
    salaryTooltipContent:
      "Enter your monthly salary before tax. This is used to calculate your SGI (sickness benefit qualifying income). Average salary in Sweden is approximately 37,000 SEK/month (2024). If you have irregular income, use an average of the last 12 months.",
    pagTooltipTitle: "Parental pay from your employer",
    pagTooltipContent:
      "With a collective agreement you often get parental pay from your employer in addition to parental benefit: about 10% of your salary and about 90% of the part above 49,333 SEK/month, usually for up to 6 months. Terms and employment requirements vary. Ask your employer or union what applies to you.",
    daysToTakeTooltipTitle: "Number of days",
    daysToTakeTooltipContent:
      "You have a total of 480 days to share. Each parent has 90 reserved days that cannot be transferred. Most common is to share equally (240 days each), but you can divide the days as you wish. Note that 390 days give higher benefit (high level) while the remaining 90 days give lower benefit (180 SEK/day).",
    daysPerWeekTooltipTitle: "Days per week",
    daysPerWeekTooltipContent:
      "You can choose between 1-7 days per week. Most common is 5 days/week (like a normal work week). Fewer days = longer calendar time but lower monthly income. More days = shorter calendar time but higher monthly income. 6-7 days/week is common the first months, then 5 days/week.",
    startDateTooltipTitle: "Start date",
    startDateTooltipContent:
      "When do you want to start taking parental benefit? You can take from the child's birth. Many choose to start right after delivery, but you can also wait. Remember to coordinate with the other parent so you don't have gaps where no one is home.",
    readMoreFK: "Read more at the Social Insurance Agency →",

    // Info cards
    infoGuideTitle: "Quick Guide",
    infoCard1Title: "SGI - Sickness Benefit Qualifying Income",
    infoCard1Content:
      "SGI is your annual income from work, at most 592,000 SEK (2026). Parental benefit is about 80% of your SGI, at most 1,259 SEK/day.",
    infoCard2Title: "Reserved days",
    infoCard2Content:
      "90 days per parent are reserved and cannot be transferred. This encourages both to take leave. The remaining 300 days can be shared freely.",
    infoCard3Title: "High and low level",
    infoCard3Content:
      "The first 390 days you get 80% of your SGI (high level). Remaining 90 days give 180 SEK/day (low level). Use high-level days when the child is young!",
    infoCard4Title: "Parental pay from your employer",
    infoCard4Content:
      "With a collective agreement you often get about 10% of your salary and about 90% of the part above 49,333 SEK/month, usually for up to 6 months. Check with your employer!",
    infoCard5Title: "Double days",
    infoCard5Content:
      "During the child's first 15 months, you can be on leave simultaneously for up to 60 days. When you take a double day, two days are counted. 60 double days = 120 days from your 480.",
    infoCard6Title: "Tax and pension",
    infoCard6Content:
      "Parental benefit is both taxable and pension qualifying. You pay tax (approx. 25-30%) but also earn pension during parental leave.",
    infoCard7Title: "How to apply",
    infoCard7Content:
      "Apply on the Social Insurance Agency's e-service 'Apply and plan parental benefit'. You need to specify dates, scope and employer. Don't forget to report salary increases!",
    infoCard8Title: "Protect your SGI",
    infoCard8Content:
      "During parental leave, your SGI is maintained automatically. If you work part-time and take vacation, SGI can decrease. Avoid vacation when combining work and parental benefit.",

    // Period card
    periodWeeksLabel: "Length (weeks)",
    periodApproxMonths: "≈ {months} mo",
    periodSummary: "{start} – {end} · {weeks} weeks · {days} days",
    worksOtherDaysQuestion: "Do you work the other days?",
    worksOtherDaysNo: "No",
    worksOtherDaysYes: "Yes",
    worksOtherDaysHelpNo:
      "You are off the whole week but only take parental benefit {days} days. The other days are unpaid.",
    worksOtherDaysHelpYes: "You get salary for {days} working days a week.",

    // Planner
    plannerNote: "New planner – work in progress",
    plannerBackToOld: "Back to the old view",
    plannerFormLabel: "Fill in",
    plannerPlanLabel: "Your plan",
    plannerTabsLabel: "Ways to plan",
    plannerTabQuick: "Quick start",
    plannerTabDetailed: "Detailed plan",
    plannerComingSoon: "This part is built in the next step.",
    plannerPlanHeading: "Your plan",

    // Quick start
    qsPresetsLabel: "Quick choices",
    qsPresetEqual: "Share equally",
    qsPresetLongest: "As long as possible",
    qsPresetMoreMoney: "More money per month",
    qsNumParents: "How many parents share the days?",
    qsOneParent: "1 parent",
    qsTwoParents: "2 parents",
    qsBirthDate: "When is the child born or due?",
    qsFirst: "Who is at home first?",
    qsMonths: "How long do you want to be at home?",
    qsMonthsValue: "{months} mo · {days} days",
    qsMonthsNone: "not at home",
    qsDaysPerWeek: "How many days a week do you take?",
    qsDaysOption: "{days} days",
    qsDaysPerWeekHint: "5 days = fully off, weekends are saved.",
    qsTogether: "Do you want to be at home together at the start?",
    qsTogetherNo: "No",
    qsTogetherWeeks: "{weeks} weeks",
    qsTogetherHint: "The parent who did not give birth also gets 10 days in connection with the birth. They are a separate benefit and are not taken from the 480 days.",
    qsSalary: "Salary per month before tax",
    qsTopUp: "{name} gets parental pay from the employer (collective agreement)",
    qsOverwriteNotice: "You have changed the periods in the detailed plan. The quick start suggestion will overwrite them.",
    qsOverwriteApply: "Use the suggestion",
    qsToDetailed: "Fine-tune the periods →",

    // Footer
    disclaimerText:
      "Calculations are indicative. Contact the Swedish Social Insurance Agency for exact figures.",
    privacyFooterText: "Data is not saved and never leaves your browser.",
  },
};
