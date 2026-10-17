# Föräldrapengen – projektinstruktioner för Claude

## Om projektet

Föräldrapengen (foraldrapengen.se) är en gratis kalkylator som hjälper föräldrar i Sverige att förstå föräldrapenningen och se hur familjens ekonomi påverkas månad för månad beroende på hur de planerar sina dagar.

- Hostas på Vercel. Egna domänen foraldrapengen.se är ännu inte kopplad.
- **Ingen användardata får sparas** – ingen backend, ingen databas, inga cookies med personuppgifter. Allt räknas i webbläsaren.
- Användaren ska enkelt kunna **kopiera** (urklipp) och **ladda ner** (CSV/Excel) sitt resultat.
- Språk: svenska som standard, engelska via LanguageContext/translations.ts.

## Teknik

- React 19 + TypeScript, Create React App (react-scripts 5).
- Tailwind laddas just nu via CDN i public/index.html (bör flyttas till byggsteget).
- Ikoner: lucide-react.

## Hur du ska arbeta

- Agera som senior utvecklare. Skriv ren, välstrukturerad kod i små, återanvändbara komponenter.
- Håll beräkningslogik i `src/utils/` (ren TypeScript, inga React-beroenden) så den går att enhetstesta.
- Använd strikta typer – undvik `any`.
- All användarsynlig text ska gå via translations.ts, inte hårdkodas med `language === "sv" ? ... : ...`.
- Gör en uppgift i taget och förklara kort vad du ändrat och varför.
- Kör `npm run build` (och tester när de finns) innan du säger att något är klart.
- Föreslå gärna förbättringar, men fråga innan stora omskrivningar eller nya beroenden.

## Beräkningar

Beloppen är approximationer av Försäkringskassans regler (SGI-tak, dagersättning, lägstanivå 180 kr/dag, PAG). Konstanterna i calculations.ts behöver ses över varje år när prisbasbeloppet ändras. Var tydlig med att beräkningen är vägledande.

## Redan åtgärdat (okt 2026)

- NaN i totalkolumnen i CSV-exporten för ensamföräldrar (exportUtils.ts, `parent2Total ?? 0`).
- index.html: lang="sv", riktig titel/beskrivning, canonical, Open Graph/Twitter-taggar, theme-color #4F46E5.
- sitemap.xml: tog bort ankarlänkarna #guide/#faq.

## Att göra (prioritetsordning)

1. Enhetstester för `calculations.ts` och `exportUtils.ts`; ersätt CRA:s standardtest i App.test.tsx.
2. Bryt ut den dubblerade PAG-/skatte-/nivålogiken som finns i både `calculateParentBenefits` och `getMonthlyIncomeForParent` till gemensamma funktioner.
3. Typsäkra `updateParent`/`updatePeriod` i App.tsx med generics (`keyof Parent`).
4. Flytta datumhjälpare (`getDateAfterDays` m.fl.) och dubbeldagsberäkningen från App.tsx till `periodHelpers.ts`.
5. Flytta hårdkodade sv/en-texter i App.tsx och MonthlyIncomeTable.tsx till translations.ts.
6. Installera Tailwind via PostCSS istället för CDN.
7. Verifiera 2026 års belopp (prisbasbelopp, SGI-tak, maxbelopp per dag) mot forsakringskassan.se.
8. Längre fram: migrera från Create React App till Vite.
