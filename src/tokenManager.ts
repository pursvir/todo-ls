import { Position } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { Token } from "./parser/tokenTypes";
import { getTokenizedText } from "./parser/tokenizer";

export const tokenCache: Map<string, Token[]> = new Map<string, Token[]>();

export const retrieveDocTokens = (doc: TextDocument): Token[] | undefined => {
  if (!tokenCache.has(doc.uri))
    tokenCache.set(doc.uri, getTokenizedText(doc.getText()));
  return tokenCache.get(doc.uri);
};

export const getIndexAtPosition = (
  list: Token[],
  position: Position,
  forSplice: boolean = true,
): number => {
  let left: number = 0;
  let right: number = forSplice ? list.length : list.length - 1;

  /* Binary search adaptation for token list and for calculating indexes of objects as if they were present in list (for splice). */
  while (left <= right) {
    let mid: number = (left + right) >> 1;

    let cmp = comparePositions(position, list[mid]);
    if (!cmp) {
      return mid;
    } else if (cmp > 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (forSplice) {
    return left;
  } else {
    return -1;
  }
};

export const getTokenEnd = (token: Token): number => {
  return token.character + token.content.length;
};

const comparePositions = (position: Position, token: Token): number => {
  if (position.line !== token.line) return position.line < token.line ? -1 : 1;
  return position.character < token.character ? -1 : position.character > token.character + token.content.length ? 1 : 0;
}

export const positionIsInsideToken = (position: Position, token: Token): boolean => {
  return (!comparePositions(position, token));
};
