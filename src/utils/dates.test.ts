// Tester för rena kalenderdatum (A15). Körs i svensk tid via jest.globalSetup.js.

import {
  addDays,
  dateParts,
  daysInMonth,
  diffDays,
  fromDayNumber,
  isValidDate,
  monthEndDay,
  monthStartDay,
  toDayNumber,
  todayDate,
} from "./dates";

test("testerna körs i svensk tid", () => {
  // Sommartid: UTC+2
  expect(new Date(2026, 6, 1).getTimezoneOffset()).toBe(-120);
});

describe("toDayNumber / fromDayNumber", () => {
  test("1970-01-01 är dag 0", () => {
    expect(toDayNumber("1970-01-01")).toBe(0);
  });

  test.each(["2026-01-01", "2026-03-29", "2026-10-25", "2028-02-29", "2026-12-31"])(
    "%s blir samma datum fram och tillbaka",
    (date) => {
      expect(fromDayNumber(toDayNumber(date))).toBe(date);
    }
  );

  test.each(["", "2026-3-1", "abc", "2026-03-01T00:00"])(
    "ogiltigt datum %p ger NaN",
    (date) => {
      expect(toDayNumber(date)).toBeNaN();
      expect(isValidDate(date)).toBe(false);
    }
  );
});

describe("addDays", () => {
  test("över sommartidens början", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
  });

  test("över sommartidens slut", () => {
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
  });

  test("över månadsskifte och årsskifte", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  test("skottdag", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });

  test("negativa dagar", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("diffDays", () => {
  test("hela dagar även över sommartidsövergången", () => {
    expect(diffDays("2026-03-28", "2026-03-30")).toBe(2);
    expect(diffDays("2026-03-30", "2026-03-28")).toBe(-2);
  });
});

describe("månader", () => {
  test("daysInMonth", () => {
    expect(daysInMonth(2026, 0)).toBe(31);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 3)).toBe(30);
  });

  test("monthStartDay och monthEndDay", () => {
    expect(fromDayNumber(monthStartDay(2026, 2))).toBe("2026-03-01");
    expect(fromDayNumber(monthEndDay(2026, 2))).toBe("2026-03-31");
    expect(fromDayNumber(monthEndDay(2026, 11))).toBe("2026-12-31");
  });

  test("dateParts har månad 0–11", () => {
    expect(dateParts("2026-03-15")).toEqual({ year: 2026, month: 2, day: 15 });
  });
});

describe("todayDate", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("ger lokalt datum strax efter midnatt, inte gårdagens UTC-datum", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2026, 9, 17, 0, 30));

    expect(todayDate()).toBe("2026-10-17");
  });

  test("ger lokalt datum sent på kvällen", () => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2026, 9, 17, 23, 30));

    expect(todayDate()).toBe("2026-10-17");
  });
});
