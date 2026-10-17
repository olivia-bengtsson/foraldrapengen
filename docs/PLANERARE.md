# Ny planerare – specifikation

Den här filen beskriver det nya planeringsflödet. Den klickbara skissen ligger i `docs/planeringsskiss.html` (öppna den i webbläsaren). Skissen visar upplevelsen. Bygg den i projektets egen struktur, med React-komponenter och beräkningar i `src/utils/`. Kopiera inte skissens kod rakt av.

## Varför
Dagens formulär kräver att man redan kan reglerna. Man väljer exakta datum, räknar dagar själv och ser fel först när något blir rött. Förstagångsföräldrar tänker i stället "jag är hemma första halvåret, sen tar du över". Planeraren ska översätta det till dagar, datum och pengar och visa resultatet direkt.

## Layout
- **Desktop (≥ 920 px):** två kolumner. Vänster: formulär. Höger: visualisering och hjälp, `position: sticky` så att den syns medan man fyller i.
- **Mobil:** en kolumn, med visualiseringen överst och formuläret under.
- Vänster kolumn har två flikar: **Snabbstart** och **Detaljerad plan**. Båda redigerar samma plan.

## Datamodell (löser A3)
En period lagras som `{ id, start, weeks, daysPerWeek, level }`.
- `start`: datumsträng `YYYY-MM-DD`, hanteras som rent datum utan tidszon (A15).
- `weeks`: heltal. Användaren anger längd i månader (steg 0,5), som räknas om med `weeks = round(månader × 52 / 12)`.
- `slutdatum = start + weeks × 7 − 1` och `dagar = weeks × daysPerWeek` räknas alltid fram och lagras aldrig.
- Det finns inga separata fält för slutdatum eller antal dagar, så de kan aldrig hamna i otakt.
- Dubbeldagar är inte ett eget fält. De räknas fram ur överlappet mellan föräldrarnas perioder (A4).

## Snabbstart
Frågor i den här ordningen. Svaren genererar planen live:
1. Antal föräldrar (1 / 2)
2. Barnets födelsedatum (eller beräknat datum)
3. Vem är hemma först? (bara 2 föräldrar)
4. Hur länge är var och en hemma? Reglage i månader, 0–16 (0–18 för en förälder), med "X mån · Y dagar" bredvid
5. Dagar per vecka (5 / 6 / 7), med hjälptexten "5 dagar = helt ledig, helgerna sparas"
6. Hemma tillsammans i början? (Nej / 2 / 4 / 8 veckor, bara 2 föräldrar)
7. Lön per månad före skatt per förälder
8. Föräldralön från arbetsgivaren (kryssruta per förälder)
9. Kommun (för skatten, från Fas 3)

Knappen "Finjustera perioderna →" byter till Detaljerad plan.

**Generering** (ren funktion i `src/utils/`, med tester):
- Tillsammans-perioden läggs på föräldern som börjar *sedan*, från födseln, 5 dagar/vecka.
- Föräldern som börjar får sin period från födseln. Den andra tar över dagen efter.
- Dagar fördelas kronologiskt: först sjukpenningnivå, sedan lägstanivå. Perioden delas i två när nivån byter.
- Spara alltid upp till 90 sjukpenningdagar åt den andra föräldern (reserverade dagar).
- Dagar som inte ryms i 390/90 läggs ändå in, så att mätarna visar att planen är för lång.
- Ändras något i Snabbstart efter att användaren redigerat i Detaljerad plan: visa en tydlig rad om att förslaget skriver över ändringarna. Använd inte `confirm()`.

## Detaljerad plan
- Ett kort per förälder med redigerbart namn och föräldrapenningnivå. Lön och föräldralön kan visas här också.
- Varje period: startdatum, längd (mån), dagar/vecka (1–7), nivå (sjukpenningnivå / lägstanivå). Under fälten: "1 mar 2026 – 28 nov 2026 · 39 veckor · 195 dagar".
- **+ Lägg till period från {datum}:** ny period startar dagen efter förälderns sista period.
- Startdatum får inte vara före födseln (`min`).
- Överlapp med egen föregående period: ingen röd ruta, utan en rad med knappen "Flytta start till {datum}".
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
