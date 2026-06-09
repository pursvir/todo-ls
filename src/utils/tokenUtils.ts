import { TextDocument } from "vscode-languageserver-textdocument";

import { tokenizeText } from "../parser/tokenizer";
import { Token } from "../parser/tokenTypes";
import { Position, Range } from "vscode-languageserver";

/** Cache for `document`s' tokens.
 * Keys are documents' URIs, values are `Token[]` lists, always sorted in ascending order. */
export const tokenCache: Map<string, Token[]> = new Map<string, Token[]>();

/** Key-value documents' key cache. Used for completion suggestions. */
const keyCache: Map<string, Set<string>> = new Map<string, Set<string>>;

/**
 * Cache document's tokens and return them.
 * @param doc - TextDocument itself
 * @returns list of Tokens
 */
export const getDocTokens = (doc: TextDocument): Token[] => {
  // if (!tokenCache.get(doc.uri)) {
  tokenCache.set(doc.uri, tokenizeText(doc.getText()));
  // }
  // @ts-expect-error: TS2322
  return tokenCache.get(doc.uri);
};

/**
 * A helper function which returns `token`'s character end.
 */
export const getTokenEnd = (token: Token): number => {
  return token.character + token.content.length;
};

/**
 * Calculate a `Range` a `token` takes.
 */
export const rangeForToken = (token: Token): Range => {
  return {
    start: {
      line: token.line,
      character: token.character,
    },
    end: {
      line: token.line,
      character: getTokenEnd(token),
    },
  };
};

/**
 * Calculate a `Range` between `token1` and `token2`.
 */
export const rangeBetweenTokens = (
  token1: Token,
  token2: Token,
): Range => {
  return {
    start: {
      line: token1.line,
      character: token1.character,
    },
    end: {
      line: token2.line,
      character: getTokenEnd(token2),
    },
  };
};

const comparePositions = (position: Position, token: Token): number => {
  if (position.line !== token.line) return position.line - token.line;
  return token.character <= position.character &&
    position.character <= getTokenEnd(token)
    ? 0
    : position.character - token.character;
};

/**
 * Returns if `position` is pointing to some of the `Token[]`s (not in "whitespace" area of the document).
 */
export const positionIsInsideToken = (
  position: Position,
  token: Token,
): boolean => {
  return !comparePositions(position, token);
};

/**
 * A special type which indicates numeric index of document token and if it is inside one of the tokens.
 * If a position is in a "whitespace" area of the text, then an index will be the nearest token index (from the left) plus one.
 */
export interface TokenPointer {
  index: number;
  isInsideToken: boolean;
}

/**
 * Calculate the index of the token in tokens array `position` is pointing to and a boolean pointing if the position is inside the found token index.
 * @param tokens document's token array.
 * @param position in the document.
 * @param forSplice whether an index is needed for token insert (`true`) or to find the token match (`false`).
 * @returns the result `TokenPointer`.
 */
export const getIndexAtPosition = (
  tokens: Token[],
  position: Position,
  forSplice: boolean = true,
): TokenPointer => {
  let left: number = 0;
  let right = tokens.length - 1;

  if (right < 0) {
    return {
      index: 0,
      isInsideToken: false,
    } as TokenPointer;
  }

  // This is a binary search adaptation for token list
  // and for calculating indexes of objects as if they were present in the list (for future splices).
  // NOTE: I'm not sure this algorithm is correct in all use cases (it's vibe coded...).
  while (left <= right) {
    let mid: number = Math.floor((left + right) / 2);

    let cmp: number = comparePositions(position, tokens[mid]);
    if (cmp === 0) {
      return {
        index: mid,
        isInsideToken: positionIsInsideToken(position, tokens[mid]),
      } as TokenPointer;
    } else if (cmp > 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (forSplice) {
    const isInside: boolean =
      left < tokens.length && positionIsInsideToken(position, tokens[left]);
    return { index: left, isInsideToken: isInside };
  } else {
    return { index: -1, isInsideToken: false };
  }
};
