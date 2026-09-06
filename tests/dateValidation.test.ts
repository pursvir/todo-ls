import { isValidDate } from "../src/utils/dateUtils";

describe("Test date validator", () => {
  test.each([
    { dateString: "0000-00-00", expectation: false },
    { dateString: "0010-12-05", expectation: false },
    { dateString: "1000-00-00", expectation: false },
    { dateString: "1010-10-00", expectation: false },
    { dateString: "1003-00-10", expectation: false },
    { dateString: "1002-00-01", expectation: false },
    { dateString: "1004-01-00", expectation: false },
    { dateString: "0123-01-01", expectation: false },
    { dateString: "2026-01-01", expectation: true },
    { dateString: "2026-01-30", expectation: true },
    { dateString: "2026-02-29", expectation: false },
    { dateString: "2024-02-29", expectation: true },
    { dateString: "2020-13-05", expectation: false },
    { dateString: "2025-02-30", expectation: false },
    { dateString: "2025-02-31", expectation: false },
    { dateString: "2025-02-36", expectation: false },
    { dateString: "2026-04-31", expectation: false },
    { dateString: "2026-06-32", expectation: false },
    { dateString: "2026-07-31", expectation: true },
    { dateString: "2026-12-31", expectation: true },
    { dateString: "2025-01-00", expectation: false },
  ])("Date $dateString is $expectation",
    ({ dateString, expectation }): void => {
    expect(isValidDate(dateString)).toStrictEqual(expectation);
  });
});
