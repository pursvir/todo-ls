import { determineTokenType } from "./parser";
import { Token } from "./tokenTypes";
import { getLines } from "./utils";

const TOKEN_PATTERN: RegExp = /\S+/g;

/**
 * Convert individual `text` line into a `Token[]` array. `lineOffset` and `charOffset` arguments are optional.
 */
const tokenizeLine = (
  text: string,
  targetLine: number = 0,
  charOffset: number = 0,
): Token[] => {
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;

  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const newTokenChar: number = match.index + charOffset;
    const newToken: Token = {
      line: targetLine,
      character: newTokenChar,
      content: match[0],
      tokenType: determineTokenType(match[0], targetLine, newTokenChar, tokens),
    };
    tokens.push(newToken);
  }

  return tokens;
};

/**
 * Convert `text` into a `Token[]` array. `lineOffset` and `charOffset` arguments are optional.
 */
export const tokenizeText = (
  text: string,
  lineOffset: number = 0,
  charOffset: number = 0,
): Token[][] => {
  const textLines: string[] = getLines(text);
  const tokens: Token[][] = [tokenizeLine(textLines[0], lineOffset, charOffset)];
  for (let i: number = 1; i < textLines.length; i++)
    tokens.push([...tokenizeLine(textLines[i], lineOffset + i, 0)]);
  return tokens;
};
