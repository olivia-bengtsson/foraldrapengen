# Ny planerare – specifikation

Den här filen beskriver det nya planeringsflödet. Den klickbara skissen ligger i `docs/planeringsskiss.html` (öppna den i webbläsaren). Skissen visar upplevelsen. Bygg den i projektets egen struktur, med React-komponenter och beräkningar i `src/utils/`. Kopiera inte skissens kod rakt av.

## Varför
Dagens formulär kräver att man redan kan reglerna. Man väljer exakta datum, räknar dagar själv och ser fel först när något blir rött. Förstagångsföräldrar tänker i stället "jag är hemma första halvåret, sen tar du över". Planeraren ska översätta det till dagar, datum och pengar och visa resultatet direkt.

## Ändringar sedan specen skrevs
Specen är uppdaterad på de här punkterna. Där den och koden skiljer sig gäller koden och docs/GRANSKNING-2026.md.

| Område | Först i specen | Nu |
|---|---|---|
| Längd i Detaljerad plan | månader (steg 0,5) | veckor med "≈ X mån". Bara Snabbstart använder månader. |
| Färre än 5 dagar/vecka | – | frågan "Jobbar du de andra dagarna?" (`worksOtherDays`, standard Nej) |
| Föräldralön | kryssruta | Snabbstart: kryssruta som ger 10 % / 90 % / 180 dagar. Detaljerad plan: tre fält. Räknas i kalendertid (A9). |
| SGI efter ettårsdagen | – | varning, gör inte planen ogiltig (B4) |
| Reserverade dagar | "går förlorade" | förlorade dagar är en varning. Dubbeldagar som inte ryms utöver de reserverade gör planen ogiltig (A5, A6). |
| 15 månader / 1 år | – | `addMonths`/`addYears`: finns inte dagen blir det månadens sista dag |
| Inkomstgraf | skissens egen beräkning | appens `getMonthlyIncomeForParent` (skatt 30 % tills Fas 4) |
| Kommun | Fas 3 | befintliga `MunicipalitySelector` i Snabbstart redan i punkt 12, ny data i Fas 4 |
| Exempel | – | förval i Snabbstart; `OnboardingGuide` tas bort i punkt 18 |

## Samexistens med den gamla vyn
Tills punkt 18 visas planeraren bara med `?planerare` i adressen. Båda vyerna använder samma tillstånd via `usePlan()` (`src/hooks/usePlan.ts`), så de redigerar samma plan. Månadstabellen byggs av `buildMonthlyData` (`src/utils/monthlyData.ts`).

## Färger
Använd sajtens färger via Tailwind: grönt är `green-*` (mappat till Tailwind 2:s emerald i `tailwind.config.js`), inte skissens nyans. Förälder 2 kan använda `indigo-*` (samma som theme-color #4F46E5).

## Layout
- **Desktop (≥ 920 px, Tailwind-brytpunkten `planner:`):** två kolumner. Vänster: formulär. Höger: visualisering och hjälp, `position: sticky` så att den syns medan man fyller i.
- **Mobil:** en kolumn, med visualiseringen överst och formuläret under.
- Vänster kolumn har två flikar: **Snabbstart** och **Detaljerad plan**. Båda redigerar samma plan.

## Datamodell (löser A3)
En period lagras som `{ id, start, weeks, daysPerWeek, level, worksOtherDays }`.
- `start`: datumsträng `YYYY-MM-DD`, hanteras som rent datum utan tidszon (A15).
- `weeks`: heltal ≥ 1. I Detaljerad plan anges längden i veckor. Bara Snabbstart använder månader (steg 0,5), som räknas om med `weeks = round(månader × 52 / 12)` (`weeksFromMonths`).
- `slutdatum = start + weeks × 7 − 1` (`periodEnd`) och `dagar = weeks × daysPerWeek` (`periodDays`) räknas alltid fram och lagras aldrig. Funktionerna finns i `src/utils/periodHelpers.ts`.
- Det finns inga separata fält för slutdatum eller antal dagar, så de kan aldrig hamna i otakt.
- Dubbeldagar är inte ett eget fält. De räknas fram ur överlappet mellan föräldrarnas perioder (A4).

## Snabbstart
Frågor i den här ordningen. Svaren genererar planen live:
1. Antal föräldrar (1 / 2)
2. Barnets födelsedatum (eller beräknat datum)
3. Vem är hemma först? (bara 2 föräldrar)
4. Hur länge är var och en hemma? Reglage i månader, 0–16 (0–18 för en förälder), med "X mån · Y dagar" bredvid
5. Dagar per vecka (5 / 6 / 7), med hjälptexten "5 dagar = helt ledig, helgerna sparas"
6. Hemma tillsammans i början? (Nej / 2 / 4 / 8 veckor, bara 2 föräldrar). Hjälptext: "Den som inte födde barnet har dessutom 10 dagar i samband med födseln. De är en egen ersättning och tas inte från de 480 dagarna."
7. Lön per månad före skatt per förälder
8. Föräldralön från arbetsgivaren (kryssruta per förälder)
9. Kommun (för skatten, från Fas 3)

Knappen "Finjustera perioderna →" byter till Detaljerad plan.

**Förval** överst: "Dela lika" (9 + 9 mån, 5 d/v, 2 veckor tillsammans), "Så länge som möjligt" (11 + 11 mån, 5 d/v, alla 480 dagar) och "Mer pengar per månad" (6 + 6 mån, 7 d/v). Förvalen följer samma skydd mot överskrivning som övriga svar. Förvalen ersätter exempelfliken.

Svaren fylls i från den nuvarande planen när planeraren öppnas (`answersFromPlan`). Planen ändras först när ett svar ändras. Antal föräldrar, födelsedatum, lön och föräldralön läses alltid från planen (samma värden som i Detaljerad plan); lön och föräldralön uppdaterar bara föräldern, inte perioderna.

**Generering** (ren funktion i `src/utils/`, med tester):
- Tillsammans-perioden läggs på föräldern som börjar *sedan*, från födseln, 5 dagar/vecka.
- Föräldern som börjar får sin period från födseln. Den andra tar över dagen efter.
- Dagar fördelas kronologiskt: först sjukpenningnivå, sedan lägstanivå. Perioden delas i två när nivån byter.
- Spara alltid upp till 90 sjukpenningdagar åt den andra föräldern (reserverade dagar).
- Dagar som inte ryms i 390/90 läggs ändå in, så att mätarna visar att planen är för lång.
- Ändras något i Snabbstart efter att användaren redigerat i Detaljerad plan: visa en tydlig rad om att förslaget skriver över ändringarna. Använd inte `confirm()`. I koden: `planSource` i `usePlan` är `"manual"` efter periodändringar; då sparas svaren och raden "Använd förslaget" visas i stället för att planen genereras om.
- Den andra föräldern börjar aldrig under sin egen tillsammans-period (om den första är hemma kortare än tillsammans-tiden).

## Detaljerad plan
- Överst: barnets födelsedatum.
- Ett kort per förälder med redigerbart namn, anställningsform, lön och föräldralön från arbetsgivaren (tre fält, bara för anställda; andra ser "gäller bara anställda").
- Varje period: startdatum, längd i veckor med ungefärligt antal månader bredvid ("18 veckor ≈ 4 mån", `monthsFromWeeks`), dagar/vecka (1–7), nivå (sjukpenningnivå / lägstanivå). Under fälten: "1 mar 2026 – 28 nov 2026 · 39 veckor · 195 dagar".
- Vid färre än 5 dagar/vecka: frågan **"Jobbar du de andra dagarna?"** (Nej / Ja, fältet `worksOtherDays`, standard Nej). Ja = lön för `(5 − dagar/vecka) / 5` av veckan. Nej = helt ledig, de andra dagarna är obetalda (A2).
- Varning (gör inte planen ogiltig): en period på eller efter barnets ettårsdag med färre än 5 dagar/vecka och "Nej" ger texten "Efter barnets ettårsdag behöver du ta ut föräldrapenning minst 5 hela dagar i veckan om du är helt ledig. Annars förlorar du din SGI, som styr din sjukpenning och föräldrapenning." (B4)
- **+ Lägg till period från {datum}:** ny period startar dagen efter förälderns sista period.
- Startdatum får inte vara före födseln (`min`).
- Överlapp med egen föregående period: ingen röd ruta, utan en rad med knappen "Flytta start till {datum}" (`findPreviousOverlaps`).
- Utan perioder börjar "Lägg till period" vid födseln.
- Varje periodrad har `id="period-{id}"` så att tidslinjen kan scrolla dit.
- Hovra en period → motsvarande block på tidslinjen markeras.

## Höger kolumn
1. **Tidslinje**: en rad per förälder från födseln, 18–30 månader beroende på planen.
   - Block i förälderns färg. Lägstanivå randig. Färre än 5 dagar/vecka ljusare.
   - Raden **Tillsammans** visar överlapp (dubbeldagar). Överlapp efter 15 månader i varningsfärg.
   - Raden **Någon hemma** visar täckning och **luckor** där ingen är hemma.
   - Markeringar vid 1 år och 15 månader.
   - Antalet etiketter på axeln anpassas till bredden.
   - Klick på ett block → byt till Detaljerad plan och scrolla till perioden.
   - Blocken ska vara knappar med `aria-label` (tillgänglighet).
2. **Dagar kvar att planera**: mätare för sjukpenningnivå (x kvar av 390), lägstanivå (x av 90) och dubbeldagar (x av 60, före 15 mån), med färgsegment per förälder. Röd om gränsen överskrids, med text om hur många dagar för mycket. Per förälder: antal dagar och status för reserverade dagar ("Reserverade dagar används" / "X reserverade dagar går förlorade").
3. **Hjälp**: byter text efter vilket fält som har fokus (`data-help` eller en React-kontext). Texterna ligger i translations.ts och följer docs/GRANSKNING-2026.md. Länk till Försäkringskassan.
4. **Hushållets inkomst per månad efter skatt**: staplade staplar per förälder, streckad linje för "om ni båda jobbar", y-axel i tkr. Under grafen: "Tightast blir {månad}: X kr, alltså Y kr mindre än vanligt." Rita den med egen SVG. Fråga innan ett diagrambibliotek läggs till.
5. **Exportknapparna** (kopiera / ladda ner) ligger under grafen.

## Komponenter (förslag)
```
src/components/planner/
  PlannerLayout.tsx        två kolumner, sticky höger
  QuickStart.tsx           frågorna
  DetailedPlan.tsx
  ParentPlanCard.tsx
  PeriodRow.tsx
  PlanTimeline.tsx         + TimelineRow, TimelineAxis
  DaysMeters.tsx           + Meter, ReservedDaysStatus
  HelpPanel.tsx            + HelpContext
  MonthlyIncomeChart.tsx
src/utils/
  planGenerator.ts         snabbstart → perioder (testad)
  timeline.ts              överlapp, luckor, periodens slut/dagar (testad)
```

## Det som ersätts
- De numrerade CollapsibleSection-stegen 1–4 i App.tsx
- InfoSidebar och InfoCarousel (ersätts av hjälprutan, men behåll de rättade texterna)
- Exempelfliken blir förval i Snabbstart, till exempel "Dela lika", "Mest tid hemma" och "Mest pengar"
- DaysSummary (ersätts av mätarna)
- MonthlyIncomeTable kan finnas kvar som "Visa som tabell" under grafen

## Inte i skissen men behövs
- Kommunval och kyrkoavgift (Fas 3)
- Engelsk översättning av alla nya texter
- Infotext för 240-dagarsregeln vid låg lön (A10)
