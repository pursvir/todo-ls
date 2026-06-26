import { Token } from "./tokenTypes";

const LINES_RE: RegExp = /\r?\n/;

/** A helper function for splitting `text` by newlines. */
export const getLines = (text: string): string[] => {
  return text.split(LINES_RE);
};

/**
 * Returns index of last token on a specified `tokenLine`.
 */
export const getIndexOnLine = (tokens: Token[], tokenLine: number): number => {
  let onLineIndex: number;
  for (
    onLineIndex = tokens.length - 1;
    onLineIndex > -1 && tokens[onLineIndex]?.line === tokenLine;
    onLineIndex--
  ) {} // eslint-disable-line no-empty
  return tokens.length - 1 - onLineIndex;
};
