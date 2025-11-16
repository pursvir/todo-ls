const ROWS_RE: RegExp = /\r?\n/;

export const getRows = (text: string): string[] => {
  return text.split(ROWS_RE);
};
