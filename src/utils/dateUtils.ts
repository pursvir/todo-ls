/**
 * @returns a string which represents ISO 8601 date.
 *
 * @param dayShift days count to shift from today.
 *
 */
export const generateISODate = (dayShift: number = 0): string => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000 * dayShift)
    .toISOString()
    .slice(0, 10);
};
