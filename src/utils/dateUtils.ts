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

/**
 * @returns an hour-, minute- and seconds-unaware date object.
 */
export function getToday(): Date {
    const dt: Date = new Date();
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

/** Returns if the given date is possible. */
export function isValidIsoDate(date: string): boolean {
    // TODO: for some reason, JavaScript allows creation of invalid dates which for even months.
    // For example: `new Date("2026-02-31"), new Date("2025-06-31")` and so on.
    // we should write a validator for those cases
    // @ts-ignore
    return !(isNaN(new Date(date)));
}
