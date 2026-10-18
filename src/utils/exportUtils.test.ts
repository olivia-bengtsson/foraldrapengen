import { MonthlyData, Parent, ParentalPeriod } from "../types";
import { calculateParentBenefits } from "./calculations";
import { generateCopyText, generateCsv } from "./exportUtils";
import { calculateDoubleDays } from "./periodHelpers";

const period = (overrides: Partial<ParentalPeriod> = {}): ParentalPeriod => ({
  id: "p1",
  start: "2026-03-16",
  weeks: 20,
  daysPerWeek: 5,
  level: "high",
  worksOtherDays: false,
  ...overrides,
});

const parent = (id: number, periods: ParentalPeriod[]): Parent => ({
  id,
  name: `Förälder ${id}`,
  type: "employed",
  monthlySalary: 35000,
  employerTopUp: 0,
  employerTopUpDays: 180,
  periods,
});

// Båda lediga samma 20 veckor: 100 dubbeldagar, 200 förbrukade dagar
const parents = [parent(1, [period()]), parent(2, [period()])];
const results = parents.map((p) => calculateParentBenefits(p, 0.3));
const doubleDays = calculateDoubleDays(parents[0].periods, parents[1].periods);

describe("A4: återstående dagar räknar inte dubbeldagar två gånger", () => {
  test("kopieringstexten", () => {
    const text = generateCopyText(parents, results, "2026-03-16", doubleDays, 2);

    expect(text).toMatch(/Använda dagar: 200 av 480/);
    expect(text).toMatch(/Återstående dagar: 280/);
  });

  test("CSV", () => {
    const csv = generateCsv(parents, results, "2026-03-16", doubleDays, 2, [], "2026-10-18");

    expect(csv).toMatch(/Använda dagar,200\n/);
    expect(csv).toMatch(/Återstående dagar,280\n/);
  });
});

test("CSV för ensamförälder har ingen NaN i totalkolumnen", () => {
  const monthlyData: MonthlyData[] = [{ month: "2026-04", parent1Total: 20000, parent1Days: 30 }];
  const csv = generateCsv(parents, results, "2026-03-16", 0, 1, monthlyData, "2026-10-18");

  expect(csv).toMatch(/2026-04,20000,20000\n/);
  expect(csv).not.toMatch(/NaN/);
});
