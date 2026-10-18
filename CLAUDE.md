# Föräldrapengen – projektinstruktioner för Claude

## Om projektet
Föräldrapengen (foraldrapengen.se) är en gratis kalkylator som hjälper föräldrar i Sverige att förstå föräldrapenningen och se hur familjens ekonomi påverkas månad för månad beroende på hur de planerar sina dagar.

- Hostas på Vercel. Egna domänen foraldrapengen.se är ännu inte kopplad.
- **Ingen användardata får sparas** – ingen backend, ingen databas, inga cookies med personuppgifter. Allt räknas i webbläsaren.
- Användaren ska enkelt kunna **kopiera** (urklipp) och **ladda ner** (CSV/Excel) sitt resultat.
- Språk: svenska som standard, engelska via LanguageContext/translations.ts.

## Teknik
- React 19 + TypeScript, Create React App (react-scripts 5).
- Tailwind 3 via PostCSS (CRA 5), konfiguration i `tailwind.config.js`. Färgerna `green`, `yellow` och `purple` är mappade till Tailwind 2:s palett (emerald, amber, violet) och skuggorna till Tailwind 2:s värden, så att sajten ser ut som förut. Sajtens gröna är alltså `green-*` (= emerald). Skriv alltid hela klassnamn (inga `bg-${färg}-100`), annars genereras de inte.
- Ikoner: lucide-react.

## Hur du ska arbeta
- Agera som senior utvecklare. Skriv ren, välstrukturerad kod i små, återanvändbara komponenter.
- Håll beräkningslogik i `src/utils/` och regler i `src/rules/` (ren TypeScript, inga React-beroenden) så den går att enhetstesta.
- Använd strikta typer – undvik `any`.
- Datum är alltid strängar `YYYY-MM-DD` och hanteras med funktionerna i `src/utils/dates.ts` (rena kalenderdatum, ingen tidszon). Använd inte `new Date(sträng)`, `toISOString()` eller `setDate` direkt. Periodlogik (slutdatum, överlapp, dubbeldagar) ligger i `src/utils/periodHelpers.ts`.
- Testerna körs i svensk tid (`TZ=Europe/Stockholm` via `jest.globalSetup.js`).
- **Referensfilen för belopp** (`src/utils/__fixtures__/amounts.json`, testas i `src/utils/amounts.test.ts`) får bara genereras om (`UPDATE_FIXTURE=1 CI=true npm test -- amounts`) när en ändring **avsiktligt** ändrar belopp. Säg då vilka belopp som ändrats och varför, så att det kan granskas innan commit. Fallerar referenstestet utan att belopp ska ändras är det ett fel i koden som ska rättas, inte en fil som ska genereras om.
- All användarsynlig text ska gå via translations.ts, inte hårdkodas med `language === "sv" ? ... : ...`.
- Gör en uppgift i taget. Förklara kort vad du ändrat och varför.
- Kör `npm test` och `npm run build` innan du säger att något är klart.
- Föreslå gärna förbättringar, men fråga innan stora omskrivningar eller nya beroenden.
- Uppdatera listan nedan när en punkt är klar.

## Regler och fakta
Alla regler, belopp och källor för 2026 finns i **docs/GRANSKNING-2026.md** (avsnitt 1). Använd bara siffror därifrån. Hitta inte på regler. Är du osäker, fråga eller länka till Försäkringskassan.

Formel: `dagersättning = round(SGI × 0,97 × 0,80 / 365)`, inom 250–1 259 kr. SGI = årsinkomst, högst 592 000 kr (0 om under 14 200 kr).

## Redan åtgärdat
- NaN i CSV-exportens totalkolumn för ensamföräldrar (exportUtils.ts).
- index.html: lang="sv", titel/beskrivning, canonical, Open Graph/Twitter, theme-color #4F46E5.
- sitemap.xml: tog bort ankarlänkarna #guide/#faq.
- Tester för beräkningarna i `src/utils/calculations.test.ts` (CRA:s standardtest borttaget). Kända fel finns som `test.skip` med en kommentar om punkten. När ett fel rättas: byt `test.skip` mot `test`.

## Att göra (i ordning)
Hänvisningarna (A1, B3 …) pekar på docs/GRANSKNING-2026.md. Den nya planeraren beskrivs i docs/PLANERARE.md, och den klickbara skissen finns i docs/planeringsskiss.html.

**Fas 1 – grund**
1. ✅ Samla alla årsberoende konstanter i `src/rules/rules2026.ts` med år och källa (A13). Koden importerar `RULES` från `src/rules`. Kvar till Fas 2/4: standardskatten 0,3 (A8) och föräldralön 360 dagar (A9) i calculations.ts, App.tsx, constants, periodHelpers och municipalities.ts.
2. ✅ Hantera datum som rena datum utan tidszon (A15). Rena datumfunktioner i `src/utils/dates.ts`, periodlogik (`getDateAfterDays`, `calculateDoubleDays`, överlapp) i `periodHelpers.ts`. `getDateAfterDays` räknar fortfarande slutdatum en dag för sent; det rättas i punkt 3.
3. ✅ Ny periodmodell enligt docs/PLANERARE.md: `{ id, start, weeks, daysPerWeek, level }`. Slutdatum (`periodEnd`, startdagen är dag 1) och antal dagar (`periodDays`) räknas fram i `periodHelpers.ts` (A3). Dubbeldagar räknas fram ur överlapp (`getOverlaps`), kryssrutan är borttagen. Nuvarande formulär är bara minimalt anpassat (längd i veckor); det nya gränssnittet byggs i Fas 3.

**Fas 2 – beräkningsfel (viktigast för användarna)**
4. ✅ Begränsa sjukpenning- och lägstanivådagar till 390/90 och rätta startläget (A1). `validateLevelDays` varnar och markerar planen som ogiltig; dagar över gränsen räknas ändå med i beloppen. Startläget (`createInitialParents` i constants) och alla exempel följer 390/90 och testas i `src/constants/index.test.ts`.
5. ✅ Räkna lön rätt vid deltidsledighet (A2). Perioden har `worksOtherDays` (standard `false`): `true` ger lön för `max(0, 5 − dagar/vecka) / 5`, `false` betyder helt ledig och ingen lön. `validateSgiProtection` varnar (utan att göra planen ogiltig) för helt ledig med färre än 5 dagar/vecka efter ettårsdagen (B4). Månader/år läggs till med `addMonths`/`addYears` (sista dagen i månaden om dagen saknas), även 15-månadersgränsen för dubbeldagar.
6. ✅ Dubbeldagar: ingen dubbelräkning (`getUsedDays`), korrekt validering (A4, A5). Rätta budskapet om reserverade dagar (A6). Lägstanivåregeln kontrolleras i tidsordning med `highLevelDaysBefore` (A16). Förlorade reserverade dagar är en varning; dubbeldagar som inte ryms utöver de reserverade, fler än 390 dagar för en förälder och dubbeldagar efter 15 månader gör planen ogiltig.
7. ✅ Visa rätt SGI och flytta 0,97 in i dagersättningsformeln (A7). `calculateSGI` = årsinkomst (högst 592 000, 0 under 14 200), `calculateDailyBenefit` = round(SGI × 0,97 × 0,8 / 365) inom 250–1 259. B1 (`infoCard1`) rättad samtidigt.
8. ✅ Föräldralön: standard 180 dagar, två procentfält, nytt namn (A9). Räknas i kalendertid: sammanlagda kalenderdagar i perioder på sjukpenningnivå, per dag `årlig / 365 × min(dagar/vecka, 5) / 5` (`employerTopUpForRange`, används för både total och månad). B3, B12, B13 rättade samtidigt.
9. ✅ Bryt ut den dubblerade logiken för skatt och nivåer. `src/utils/tax.ts` (`DEFAULT_TAX_RATE`, `calculateTax`, `afterTax`), `daysByLevel`, `calendarDaysInRange`, `benefitDaysInRange` (periodHelpers) och `fkBenefitForRange`, `dailyBenefitForLevel` (calculations). Total och månad räknas med samma funktioner. Inga belopp ändrade (referensfilen genererad före ändringen).
10. ✅ Rätta avrundningen i `getDaysBetweenDates` (+1) och `monthsNeeded` (kalenderdagar × 12 / 365 via `leaveMonths`) (A11).

**Fas 3 – ny planerare (docs/PLANERARE.md)**
11. ✅ Layout: delad skärm på desktop (formulär vänster, sticky visualisering höger), staplat på mobil. Planeraren ligger i `src/components/planner/` och visas med `?planerare` tills punkt 18. Tillståndet ligger i `usePlan()` (`src/hooks/usePlan.ts`) och delas med den gamla vyn.
12. ✅ Snabbstart med `planGenerator.ts` (ren funktion, testad): `generatePlan`, `answersFromPlan`, förvalen "Dela lika", "Så länge som möjligt" och "Mer pengar per månad". Skydd mot överskrivning via `planSource` i `usePlan`. Kommun via befintliga `MunicipalitySelector`.
13. ✅ Detaljerad plan: `DetailedPlan`, `ParentPlanCard`, `PeriodRow` med framräknat slutdatum och antal dagar, "Lägg till period" och "Flytta start" (`findPreviousOverlaps`). Förvalen i Snabbstart följer skyddet mot överskrivning.
14. ✅ Tidslinje med dubbeldagar, luckor, delvis täckta veckor (jobbar övriga dagar) och markeringar vid 1 år och 15 månader. Logik i `src/utils/timeline.ts`, komponenter `PlanTimeline`, `TimelineRow`, `TimelineAxis`. Markering mellan tidslinje och Detaljerad plan via `HighlightContext`.
15. ✅ Mätare för dagar kvar och reserverade dagar (`DaysMeters`, `Meter`, `ReservedDaysStatus`, siffror från `daysMeters.ts` och `reservedDaysStatus`). Rutan "Att tänka på" (`ThingsToConsider`) visar varningar som mätarna inte visar. Valideringarna returnerar `issues` med kod och allvarlighet (`error`/`info`) bredvid `warnings`.
16. Hjälpruta som följer fokus.
17. Inkomstgraf per månad med "tightaste månaden".
18. Ta bort det som ersätts (stegen 1–4, InfoSidebar/InfoCarousel, DaysSummary). Exempel blir förval i Snabbstart.

**Fas 4 – skatt**
19. Skattemodul för 2026 med grundavdrag, jobbskatteavdrag (bara lön), statlig skatt, begravnings- och kyrkoavgift. Standardvärde 32,38 % (A8).
20. Uppdatera kommunalskatterna till SCB 2026 med alla 290 kommuner (A12) och lägg kommunvalet i Snabbstart.

**Fas 5 – text och länkar**
21. Rätta alla texter enligt tabellen B1–B20 (B1, B3, B12, B13 redan klara). Uppdatera och kontrollera alla FK-länkar (B19).
22. Ta bort död kod: InfoModal, FlashcardModal (om oanvända), migrateParentToPeriods, legacy-fält (C).
23. Flytta hårdkodade sv/en-texter till translations.ts.
24. Infotexter för regler som inte valideras: 240-dagarsregeln, 96 dagar efter 4 år, helgregeln (A10, A14).

**Fas 6 – kodkvalitet och teknik**
25. Typsäkra uppdateringsfunktionerna med generics (`keyof`).
26. ✅ Installera Tailwind via PostCSS i stället för CDN (gjort före Fas 3).
27. Längre fram: migrera från Create React App till Vite.

## Varje år (januari)
Uppdatera `src/rules/rules2026.ts` → nytt år: prisbasbelopp, SGI-tak, maxbelopp per dag, skatteparametrar och kommunalskatter. Kör testerna.
