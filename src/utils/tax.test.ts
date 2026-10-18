import { afterTax, calculateTax, DEFAULT_TAX_RATE } from "./tax";

test("calculateTax och afterTax", () => {
  expect(calculateTax(1000, 0.32)).toBeCloseTo(320);
  expect(afterTax(1000, 0.32)).toBeCloseTo(680);
});

test("standardskattesatsen används om ingen anges", () => {
  expect(afterTax(1000)).toBeCloseTo(1000 * (1 - DEFAULT_TAX_RATE));
});
