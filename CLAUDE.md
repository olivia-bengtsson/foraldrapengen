# Föräldrapengen – projektinstruktioner för Claude

## Om projektet
Föräldrapengen (foraldrapengen.se) är en gratis kalkylator som hjälper föräldrar i Sverige att förstå föräldrapenningen och se hur familjens ekonomi påverkas månad för månad beroende på hur de planerar sina dagar.

- Hostas på Vercel. Egna domänen foraldrapengen.se är ännu inte kopplad.
- **Ingen användardata får sparas** – ingen backend, ingen databas, inga cookies med personuppgifter. Allt räknas i webbläsaren.
- Användaren ska enkelt kunna **kopiera** (urklipp) och **ladda ner** (CSV/Excel) sitt resultat.
- Språk: svenska som standard, engelska via LanguageContext/translations.ts.

## Teknik
- React 19 + TypeScript, Create React App (react-scripts 5).
- Tailwind laddas just nu via CDN i public/index.html (ska flyttas till byggsteget).
- Ikoner: lucide-react.

## Hur du ska arbeta
- Agera som senior utvecklare. Skriv ren, välstrukturerad kod i små, återanvändbara komponenter.
- Håll beräkningslogik i `src/utils/` och regler i `src/rules/` (ren TypeScript, inga React-beroenden) så den går att enhetstesta.
- Använd strikta typer – undvik `any`.
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
- Tester för beräkningarna i `src/utils/calculations.test.ts` (CRA:s standardtest borttaget). Kända fel finns som `test.skip` med en kommentar om punkten (A1–A11). När ett fel rättas: byt `test.skip` mot `test`.

## Att göra (i ordning)
Hänvisningarna (A1, B3 …) pekar på docs/GRANSKNING-2026.md. Den nya planeraren beskrivs i docs/PLANERARE.md, och den klickbara skissen finns i docs/planeringsskiss.html.

**Fas 1 – grund**
1. ✅ Samla alla årsberoende konstanter i `src/rules/rules2026.ts` med år och källa (A13). Koden importerar `RULES` från `src/rules`. Kvar till Fas 2/4: standardskatten 0,3 (A8) och föräldralön 360 dagar (A9) i calculations.ts, App.tsx, constants, periodHelpers och municipalities.ts.
2. Hantera datum som rena datum utan tidszon och samla datumhjälparna i `periodHelpers.ts` (A15).
3. Ny periodmodell enligt docs/PLANERARE.md: `{ id, start, weeks, daysPerWeek, level }`, där slutdatum och antal dagar alltid räknas fram (A3). Dubbeldagar räknas fram ur överlapp, inte från en kryssruta.

**Fas 2 – beräkningsfel (viktigast för användarna)**
4. Begränsa sjukpenning- och lägstanivådagar till 390/90 (per förälder 195/45) och rätta startläget (A1).
5. Räkna lön rätt vid deltidsledighet (A2).
6. Dubbeldagar: ingen dubbelräkning, korrekt validering (A4, A5). Rätta budskapet om reserverade dagar (A6).
7. Visa rätt SGI och flytta 0,97 in i dagersättningsformeln (A7).
8. Föräldralön: standard 180 dagar, två procentfält, nytt namn (A9).
9. Bryt ut den dubblerade logiken för föräldralön, skatt och nivåer i `calculateParentBenefits` och `getMonthlyIncomeForParent` till gemensamma, testade funktioner (görs tillsammans med 4–8).
10. Rätta avrundningen i `getDaysBetweenDates` och `monthsNeeded` (A11).

**Fas 3 – ny planerare (docs/PLANERARE.md)**
11. Layout: delad skärm på desktop (formulär vänster, sticky visualisering höger), staplat på mobil.
12. Snabbstart med `planGenerator.ts` (ren funktion, testad).
13. Detaljerad plan: föräldrakort och periodrader med framräknat slutdatum och antal dagar, "Lägg till period" och "Flytta start".
14. Tidslinje med dubbeldagar, luckor och markeringar vid 1 år och 15 månader.
15. Mätare för dagar kvar och reserverade dagar.
16. Hjälpruta som följer fokus.
17. Inkomstgraf per månad med "tightaste månaden".
18. Ta bort det som ersätts (stegen 1–4, InfoSidebar/InfoCarousel, DaysSummary). Exempel blir förval i Snabbstart.

**Fas 4 – skatt**
19. Skattemodul för 2026 med grundavdrag, jobbskatteavdrag (bara lön), statlig skatt, begravnings- och kyrkoavgift. Standardvärde 32,38 % (A8).
20. Uppdatera kommunalskatterna till SCB 2026 med alla 290 kommuner (A12) och lägg kommunvalet i Snabbstart.

**Fas 5 – text och länkar**
21. Rätta alla texter enligt tabellen B1–B20. Uppdatera och kontrollera alla FK-länkar (B19).
22. Ta bort död kod: InfoModal, FlashcardModal (om oanvända), migrateParentToPeriods, legacy-fält (C).
23. Flytta hårdkodade sv/en-texter till translations.ts.
24. Infotexter för regler som inte valideras: 240-dagarsregeln, 96 dagar efter 4 år, helgregeln (A10, A14).

**Fas 6 – kodkvalitet och teknik**
25. Typsäkra uppdateringsfunktionerna med generics (`keyof`).
26. Installera Tailwind via PostCSS i stället för CDN.
27. Längre fram: migrera från Create React App till Vite.

## Varje år (januari)
Uppdatera `src/rules/rules2026.ts` → nytt år: prisbasbelopp, SGI-tak, maxbelopp per dag, skatteparametrar och kommunalskatter. Kör testerna.
