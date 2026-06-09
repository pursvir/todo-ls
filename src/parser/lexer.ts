import { BEGINNING_TOKEN_PATTERNS, Token } from "../parser/tokenTypes";
import { TodotxtTokenType, PatternType } from "../parser/tokenTypes";
import {
  COMPLETION_MARK_RE,
  CONTEXT_RE,
  DATE_RE,
  KV_RE,
  PRIORITY_RE,
  PROJECT_RE,
} from "./regexps";
import { decodeTokenType, encodeTokenType } from "./tokenEncoder";
import { getTokenEnd } from "../utils/tokenUtils";

export const tokenPatternMap: Map<PatternType, RegExp> = new Map<
  PatternType,
  RegExp
>([
  ["priority", PRIORITY_RE],
  ["project", PROJECT_RE],
  ["context", CONTEXT_RE],
  ["date", DATE_RE],
  ["keyValue", KV_RE],
  ["completionMark", COMPLETION_MARK_RE],
]);

/**
 * Returns determined pattern type of token.
 */
const determinePatternType = (token: string): PatternType => {
  for (const [type, regex] of tokenPatternMap) {
    if (regex.test(token)) return type;
  }
  return "common";
};

/**
 * Returns index of first token on a specified `tokenLine`, treating new line start as a search entry point (0).
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

/**
 * Returns numeric representation of a token type, based on its surrounding context (`line`, `character` and previous `Token[]`'s).
 */
export const determineTokenType = (
  content: string,
  line: number,
  character: number,
  tokens: Token[],
): number => {
  let todotxtType: TodotxtTokenType;

  const onLineIndex: number = getIndexOnLine(tokens, line);
  let tokenPatternType: PatternType = determinePatternType(content);
  if (tokenPatternType === "date") {
    if (character === 0) {
      todotxtType = "creationDate";
    } else if (onLineIndex === 1) {
      const previousToken: Token = tokens[onLineIndex - 1];
      if (character - getTokenEnd(previousToken) === 1) {
        const previousTokenTypeName: TodotxtTokenType = decodeTokenType(
          previousToken.tokenType,
        );
        if (previousTokenTypeName === "completionMark") {
          todotxtType = "completionDate";
        } else if (previousTokenTypeName === "priority") {
          todotxtType = "creationDate";
        } else {
          todotxtType = "common";
        }
      } else {
        todotxtType = "common";
      }
    } else if (onLineIndex === 2) {
      const secondToken: Token = tokens[onLineIndex - 1];
      const firstToken: Token = tokens[onLineIndex - 2];
      if (
        character - getTokenEnd(secondToken) === 1 &&
        decodeTokenType(secondToken.tokenType) === "completionDate" &&
        secondToken.character - getTokenEnd(firstToken) === 1 &&
        decodeTokenType(firstToken.tokenType) === "completionMark"
      ) {
        todotxtType = "creationDate";
      } else {
        todotxtType = "common";
      }
    } else {
      todotxtType = "common";
    }
  } else {
    const beginningPatternIndex: number =
      BEGINNING_TOKEN_PATTERNS.indexOf(tokenPatternType);
    if (beginningPatternIndex === -1) {
      todotxtType = tokenPatternType as TodotxtTokenType;
    } else {
      if (character === 0)
        todotxtType = BEGINNING_TOKEN_PATTERNS[
          beginningPatternIndex
        ] as TodotxtTokenType;
      else todotxtType = "common";
    }
  }
  return encodeTokenType(todotxtType);
};
