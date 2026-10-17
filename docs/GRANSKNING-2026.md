# Granskning av beräkningar och fakta – oktober 2026

Den här filen är underlaget för att-göra-listan i CLAUDE.md. Den listar vad som är verifierat mot källor, vilka beräkningar som räknar fel och vilka texter som behöver skrivas om. Hänvisningar som A1, B3 osv. används i CLAUDE.md.

Kunde inte granskas: filen med `EXAMPLES` och `FK_LINKS` (`src/constants/...`) fanns inte med i underlaget. Kontrollera att exemplen följer reglerna nedan (särskilt 390/90-fördelningen).

---

## 1. Verifierade fakta för 2026

| Fakta | Värde 2026 | Källa |
|---|---|---|
| Prisbasbelopp | 59 200 kr | SCB, FK |
| SGI-tak (10 prisbasbelopp) | 592 000 kr/år = 49 333 kr/mån | FK aktuella belopp |
| Lägsta SGI (24 % av pbb) | 14 200 kr/år | FK aktuella belopp |
| Sjukpenningnivå, högsta | 1 259 kr/dag | FK aktuella belopp |
| Sjukpenningnivå, lägsta (grundnivå) | 250 kr/dag | FK aktuella belopp |
| Lägstanivå | 180 kr/dag | FK aktuella belopp |
| Dagar per barn | 480 (390 sjukpenningnivå + 90 lägstanivå) | FK föräldrapenning |
| Reserverade dagar | 90 per förälder, på sjukpenningnivå, kan inte föras över | FK |
| Föra över till annan försäkrad (t.ex. mor/farförälder) | högst 45 dagar per förälder, inte reserverade dagar | FK "Föra över dagar" |
| Lägstanivådagar | får tas ut först när 180 dagar på sjukpenningnivå har använts för barnet | FK dubbeldagar |
| Dubbeldagar | högst 60, före 15 månaders ålder, kostar 2 dagar (en per förälder), **inte från de reserverade dagarna**, lägstanivå som dubbeldag först efter 180 sjukpenningdagar, båda samma andel av dagen | FK dubbeldagar |
| Spara dagar | efter 4-årsdagen högst 96 dagar kvar; dagar kan användas till 12 år / slutet av åk 5 | FK |
| SGI-krav för sjukpenningnivå de första 180 dagarna | SGI motsvarande minst 7 083 kr/mån i minst 240 dagar före födseln, annars lägre ersättning | FK |
| Helger/lediga dagar (sedan 1 april 2025) | lediga dagar kräver uttag dagen före/efter i samma omfattning (undantag: minst 5 lediga dagar i följd) | FK |
| Semester | föräldrapenning betalas inte under semester | FK |
| Snitt kommunalskatt | 32,38 % (2025: 32,41 %) | Ekonomifakta/SCB |
| Brytpunkt statlig skatt (under 66 år) | 660 400 kr/år, ca 55 000 kr/mån | Ekonomifakta |
| Jobbskatteavdrag | gäller arbetsinkomst – **inte** föräldrapenning | Skatteregler |
| Föräldralön via kollektivavtal | vanligen ca 10 % av lönen + ca 90 % av lönedelen över 49 333 kr/mån, oftast i **upp till 6 månader**, krav på anställningstid varierar | Handelsbanken m.fl. |
| Ny regel 1 juli 2026 | kravet på att anmäla uttag till FK i förväg slopas (prop. 2025/26:117) – kontrollera att den antogs | Regeringen |

**Formeln för dagersättning:** `dagersättning = SGI × 0,97 × 0,80 / 365`, avrundad till hela kronor, inom 250–1 259 kr.
Kontroll: 592 000 × 0,97 × 0,8 / 365 = 1 258,6 → **1 259 kr** ✓. Lön 35 000 kr/mån → SGI 420 000 → **893 kr/dag**.

---

## 2. Beräkningsfel (A)

### A1. Kritiskt: man kan få fler än 390 dagar på sjukpenningnivå
`calculateParentBenefits` räknar alla perioder som sjukpenningnivå om inget annat valts, och ingen validering stoppar fler än 390 sjukpenningdagar. Startläget i App.tsx är 2 × 240 dagar på sjukpenningnivå = 480 sjukpenningdagar.
Effekt med 35 000 kr/mån: 90 dagar × (893 − 180) = **ca 64 000 kr för mycket före skatt** för familjen.
Åtgärd: validera totalt ≤ 390 sjukpenning- och ≤ 90 lägstanivådagar (per förälder 195 + 45 om inget förs över). Ändra startläget till 195 + 45 per förälder, eller fördela lägstanivådagar automatiskt.

### A2. Kritiskt: deltidsledighet ger noll lön
`getMonthlyIncomeForParent` räknar kalenderdagar i perioden. Täcker perioden hela månaden blir lönen 0, även vid 2–4 dagar i veckan. Den som är ledig 3 dagar och jobbar 2 får alltså ingen lön alls.
Åtgärd: arbetad andel per vecka = `max(0, 5 − dagarPerVecka) / 5` (vid 5-dagarsvecka). 6–7 dagar ger ingen extra lönebortfall.

### A3. Två sanningskällor: antal dagar vs datum
Totalbelopp använder `daysToTake`, men månadstabellen använder start- och slutdatum. Ändrar man ett datum utan att justera antalet dagar stämmer summorna inte överens.
Åtgärd: en sanningskälla. Räkna slutdatum från startdatum + dagar + dagar/vecka (eller tvärtom) och visa det andra som beräknat.

### A4. Dubbeldagar dras av två gånger
Varje förälders dagar innehåller redan de överlappande dagarna. Ändå lägger `DaysSummary` till `calculatedDoubleDays` i "Totalt tagna", och exporten räknar `480 − totalt − dubbeldagar`.
Åtgärd: förbrukade dagar = summan av föräldrarnas dagar. Det finns dessutom två parallella dubbeldagssystem (överlappsberäkningen i App.tsx och kryssrutan `isDoubleDay` som delas med 2). Behåll överlappsberäkningen och ta bort kryssrutan, eller härled den.

### A5. Dubbeldagsvalideringen är ofullständig
- Åldern kontrolleras mot periodens **startdatum**. Varje överlappande dag ska vara före 15-månadersdagen.
- Reserverade dagar får inte användas som dubbeldagar: varna om en förälders dubbeldagar är fler än förälderns dagar − 90.
- Lägstanivå som dubbeldag först efter 180 sjukpenningdagar.

### A6. Fel budskap om reserverade dagar
`validateReservedDays` säger att varje förälder "måste ta minst 90 dagar". Det är inget krav, dagarna går förlorade om de inte tas ut. Ändra till exempelvis "Förälder 2 planerar 60 dagar – 30 reserverade dagar går förlorade."

### A7. Fel SGI visas
`calculateSGI` returnerar inkomst × 0,97 och kallar det SGI. SGI är inkomsten (max 592 000). 0,97 hör hemma i dagersättningsformeln. Dagbeloppen blir nästan samma, men visad och exporterad SGI blir fel: 35 000 kr/mån visas som 407 400 i stället för 420 000.
Åtgärd: `sgi = min(årsinkomst, 592 000)` (0 om under 14 200), `dagersättning = round(sgi × 0,97 × 0,8 / 365)`, inom 250–1 259.

### A8. Skatten är förenklad på ett sätt som snedvrider jämförelsen
Samma platta procentsats används på både lön och föräldrapenning. Lön får jobbskatteavdrag, men föräldrapenning får det inte. Statlig skatt över 660 400 kr/år ignoreras. Följden är att nettolönen underskattas och tappet när man går på föräldraledighet ser mindre ut än det är, alltså precis det sajten ska visa.
Åtgärd: skattemodul för 2026 med kommunalskatt, grundavdrag, jobbskatteavdrag (bara på lön), statlig skatt, begravningsavgift och kyrkoavgift, beräknat på årsinkomst och fördelat per månad. Standardvärdet utan vald kommun bör vara 32,38 % (snittet), inte 30 %.

### A9. Föräldralön (”PAG”) modelleras för generöst
- Standard 360 dagar. De flesta avtal ger upp till 6 månader, så standard bör vara 180 dagar.
- Över taket ignoreras användarens procentsats och 10/90 är hårdkodat. Inför två fält: % under taket (standard 10) och % över taket (standard 90).
- 49 333 är hårdkodat på två ställen.
- "PAG" är inget etablerat begrepp. Kalla det "Föräldralön från arbetsgivaren".

### A10. 240-dagarsregeln och grundnivån saknas
Den som inte haft SGI ≥ 7 083 kr/mån i 240 dagar före födseln får lägre ersättning de första 180 dagarna. Visa minst en informationsruta vid låg lön.

### A11. Små avrundningsfel
`getDaysBetweenDates` saknar +1 och `monthsNeeded = veckor / 4,33`. Räkna månader direkt från datumen.

### A12. Kommunalskatterna är från 2025 och ofullständiga
Ca 80 kommuner, data från 2025, Sigtuna ligger dubbelt (även under Uppsala län) och lägsta/högsta är 2025 års. Uppdatera till SCB:s 2026-lista med alla 290 kommuner.

### A13. Årsberoende konstanter är utspridda
`MAX_SGI`, 49 333, 1 259, 180, 250, regeldagar och skattesatser finns på flera ställen. Samla dem i en fil (`src/rules/rules2026.ts`) med år och källa, så att nästa årsuppdatering bara berör en fil.

### A14. Regler som inte valideras (önskvärt)
96 dagar efter 4 år, gräns vid 12 år, helgregeln vid 6–7 dagar/vecka på lägstanivå och högst 45 dagar till annan försäkrad.

---

## 3. Felaktig eller inaktuell text (B)

| # | Fil | Fel | Rätt |
|---|---|---|---|
| B1 | translations.ts `infoCard1` (sv+en) | "SGI beräknas som 97 % av årsinkomsten", "tak ca 573 000 (2025)" | SGI är din årsinkomst av arbete, högst 592 000 kr (2026). Föräldrapenningen blir ca 80 % av SGI, högst 1 259 kr/dag. |
| B2 | translations.ts `infoCard3` | "De första 390 dagarna får du 80 %" | 390 dagar på sjukpenningnivå (ca 80 %) och 90 på lägstanivå (180 kr). Lägstanivådagar först efter 180 sjukpenningdagar. |
| B3 | translations.ts `infoCard4`, `pagTooltipContent` | "10–20 % extra", "0–20 %" | Med kollektivavtal ofta ca 10 % av lönen + ca 90 % av lönedelen över 49 333 kr/mån, oftast upp till 6 månader. |
| B4 | translations.ts `infoCard8` | "SGI behålls automatiskt" | SGI är skyddad tills barnet fyller 1 år. Därefter behöver du ta ut föräldrapenning i samma omfattning som du är ledig (heltid = 5 dagar/vecka), annars kan SGI sänkas. *(Verifiera formuleringen på FK.)* |
| B5 | translations.ts `infoCard7` | saknar arbetsgivarregeln | Lägg till: meddela arbetsgivaren minst 2 månader innan (föräldraledighetslagen). |
| B6 | translations.ts `salaryTooltipContent` | "Medellön ca 37 000 kr (2024)" | Uppdatera med SCB:s senaste siffra eller ta bort. |
| B7 | translations.ts `monthlyIncomeSubtitle` | "lön cirka 70 % efter skatt" | "lön efter skatt enligt vald kommun" (stämmer med koden). |
| B8 | InfoModal.tsx | dubbeldagar "30 dagar, 18 månader" (gammal regel), tak "1 250 kr/dag", föräldralön "av dagersättningen", skatt "30 %/25 %" | Ta bort komponenten om den inte används (README säger att knappen togs bort), annars skriv om. |
| B9 | FlashcardModal.tsx | "SGI baseras på årsinkomsten året innan" (fel: den baseras på nuvarande/förväntad inkomst), tak 573 000, "PAG = Avtalad PensionsGrundande…" (påhittat), "de första 390 dagarna", gamla länkar | Ta bort om oanvänd, annars skriv om enligt tabellen ovan. |
| B10 | ParentCard.tsx hjälptext | "5 dagar/vecka: ledig mån–fre, **jobbar helger**" | "ledig hela veckan, helgen tas inte ut". |
| B11 | ParentCard.tsx, PeriodCard.tsx | "Första 180 dagarna måste vara sjukpenningnivå" | "Lägstanivådagar kan tas ut först när 180 dagar på sjukpenningnivå har använts." |
| B12 | ParentCard.tsx | "Vanligt är 10 % för 180–360 dagar" | "Vanligt är ca 10 % i upp till 6 månader." |
| B13 | InfoSidebar.tsx (PAG) | "SGI-taket 49 000 kr/mån 2025", "3–12 månader" | "49 333 kr/mån (2026)", "oftast upp till 6 månader, beror på avtal och anställningstid". |
| B14 | OnboardingGuide.tsx | "Den mest exakta kalkylatorn" (kan inte styrkas), steg 1 nämner dubbeldagsfält som inte finns, skatt "29–35 %" och Österåker/Degerfors med 2025-värden | Ta bort superlativet, uppdatera steg 1 och 2026 års värden. Räkna om "13 000 kr"-exemplet efter uppdateringen (med 2025 års värden: 240 × 893 × 6,32 % ≈ 13 500 kr). |
| B15 | exportUtils.ts kopieringstext | "Omfattning (t.ex. 5 dagar/vecka = 71 %)" | FK frågar om omfattning per dag (hel, ¾, ½, ¼, ⅛) och vilka dagar. Skriv "datum, vilka dagar i veckan och omfattning per dag". |
| B16 | exportUtils.ts kopieringstext | "Ansök i god tid (minst 2 veckor innan)" | Ingen sådan regel. Skriv "Meddela arbetsgivaren minst 2 månader innan." Från 1 juli 2026 behöver uttag inte anmälas till FK i förväg (kontrollera att lagen antogs). |
| B17 | exportUtils.ts | "Anställningsform: Anställd" hårdkodat | Använd `parent.type`. |
| B18 | MunicipalitySelector.tsx | "Skattesatser … för 2025", "Standard (30 % skatt)" | 2026 och 32,38 % (snitt). Nämn att begravningsavgift tillkommer. |
| B19 | Alla länkar (FkLinks.ts + länkar skrivna direkt i komponenter) | Gamla sökvägar `/foralder/...` och `/sjuk/...` gick inte att hämta vid kontroll. FK använder nu `/privatperson/familj-och-barn/foraldrapenning/...` | Samla alla länkar i FkLinks.ts, uppdatera och kontrollera varje länk. |
| B20 | index.html | "arbetsgivartillägg (PAG)" | "föräldralön från arbetsgivaren". |

Korrekt i dag, behåll: 480 dagar, 90 reserverade, 60 dubbeldagar före 15 månader och inte från reserverade dagar, lägstanivå 180 kr, högsta 1 259 kr/dag, grundnivå 250 kr, ensamförälder kan få alla 480, ingen föräldrapenning under semester, inget jobbskatteavdrag på föräldrapenning, föräldrapenning är pensionsgrundande.

---

## 4. Död kod (C)
InfoModal.tsx och FlashcardModal.tsx (om de inte används), `migrateParentToPeriods`, legacy-fälten i `ParentBenefits` och `TabType` "info".

---

## Källor
- Försäkringskassan, aktuella belopp: https://www.forsakringskassan.se/privatperson/e-tjanster-blanketter-och-informationsmaterial/aktuella-belopp
- Försäkringskassan, föräldrapenning: https://www.forsakringskassan.se/privatperson/familj-och-barn/foraldrapenning
- Försäkringskassan, dubbeldagar: https://www.forsakringskassan.se/privatperson/familj-och-barn/foraldrapenning/foraldralediga-tillsammans-dubbeldagar
- Försäkringskassan, föra över dagar: https://www.forsakringskassan.se/privatperson/familj-och-barn/foraldrapenning/fora-over-eller-ta-tillbaka-dagar-med-foraldrapenning
- Försäkringskassan, helgregler från 1 april 2025: https://www.forsakringskassan.se/nyhetsarkiv/nyheter-press/2025-01-31-nya-regler-for-foraldrapenning-under-helger
- SCB, prisbasbeloppet 2026: https://scb.se/hitta-statistik/statistik-efter-amne/priser-och-ekonomiska-tendenser/priser/konsumentprisindex-kpi/pong/statistiknyhet/prisbasbeloppet-for-ar-2026
- Ekonomifakta, din skatt 2026: https://www.ekonomifakta.se/sakomraden/skatt/din-skatt-ar-2026_1246309.html
- Handelsbanken, föräldralön: https://www.handelsbanken.se/sv/ekonomi-i-livet/privatekonomi/livssituationer/familjeliv/foraldralon
- Regeringen, prop. 2025/26:117: https://regeringen.se/rattsliga-dokument/proposition/2026/02/prop.-202526117
