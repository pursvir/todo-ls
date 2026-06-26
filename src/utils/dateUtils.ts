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

/**
 * @returns an hour-, minute- and seconds-unaware date object.
 */
export const getToday = (): Date => {
  const dt = new Date();
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}
