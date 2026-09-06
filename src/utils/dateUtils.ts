/**
 * @returns a string which represents ISO 8601 date.
 *
 * @param dayShift days count to shift from today.
 *
 */
export function generateISODate(dayShift: number = 0): string {
    return new Date(Date.now() + 24 * 60 * 60 * 1000 * dayShift)
        .toISOString()
        .slice(0, 10);
}

export function getYearFirstDigit(): string {
    return generateISODate().slice(0, 1);
}

export function isLeapYear(year: number) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

/**
 * @returns an hour-, minute- and seconds-unaware date object.
 */
export function getToday(): Date {
    const dt: Date = new Date();
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function isFebruary(dtPrefix: string): boolean {
  return dtPrefix.slice(5,7) === "02";
}

const SHORT_MONTHS: string[] = ["04", "06", "09", "11"];

/**
 * Returns if the given ISO 8601 `date` is valid and possible.
 */
export function isValidDate(date: string): boolean {
  /** NOTE: `return (!isNaN(new Date(date))` wouldn't work in all cases.
   * For example, JavaScript will easily evaluate `new Date("2026-02-29")` (not the leap year) and even `new Date("2020-02-31")` and just converting those into Marches.
   * Suchs errors are unacceptable for this project, so we had to implement our own validator. */
  return (!(
    date[0] === "0"
    || date[5] > "1"
    || (date[5] === "0" && date[6] === "0")
    || (date[5] === "1" && date[6] > "2")
    || (date[8] === "0" && date[9] === "0")
    || (date[8] > "3")
    || (
      (isFebruary(date) && (
        date[8] > "2"
        || (
          !isLeapYear(parseInt(date.slice(0, 4)))
          && date[8] === "2" && date[9] > "8"
        )
      ))
      || date[8] === "3" && (
        (SHORT_MONTHS.includes(date.slice(5, 7)) && date[9] > "0")
        || date[9] > "1"
      )
    )
  ));
}
