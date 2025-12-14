import { Position } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { getTokenizedText } from "../parser/tokenizer";
import { Token } from "../parser/tokenTypes";

export const tokenCache: Map<string, Token[]> = new Map<string, Token[]>();

export const retrieveDocTokens = (doc: TextDocument): Token[] | undefined => {
  if (!tokenCache.has(doc.uri))
    tokenCache.set(doc.uri, getTokenizedText(doc.getText()));
  return tokenCache.get(doc.uri);
};

export const getTokenEnd = (token: Token): number => {
  return token.character + token.content.length;
};

const comparePositions = (position: Position, token: Token): number => {
  if (position.line !== token.line) return position.line - token.line;
  return token.character <= position.character && position.character <= getTokenEnd(token)
    ? 0 : position.character - token.character;
};

export const positionIsInsideToken = (
  position: Position,
  token: Token,
): boolean => {
  return !comparePositions(position, token);
};

export const positionIsStrictlyInsideToken = (
  position: Position,
  token: Token,
): boolean => {
  return position.line === token.line
    && token.character < position.character
    && position.character < getTokenEnd(token);
}

/**
 * Returns the index of the token in tokens array position is pointing to and a boolean pointing if the position is inside the found token index.
 * @param tokens - document's token array
 * @param position - position in the document.
 * @param forSplice - whether you need an index for token insert (true) or to find the token match (false). */
export const getIndexAtPosition = (
  tokens: Token[],
  position: Position,
  forSplice: boolean = true,
): [number, boolean] => {
  /* Binary search adaptation for token list
     and for calculating indexes of objects as if they were present in the list (for splice). */
  let left: number = 0;
  let right = tokens.length - 1;

  if (right < 0) {
    return [0, false];
  }

  while (left <= right) {
    // console.debug(`${left} ${right}`);
    let mid: number = Math.floor((left + right) / 2);

    let cmp = comparePositions(position, tokens[mid]);
    if (cmp === 0) {
      return [mid, positionIsStrictlyInsideToken(position, tokens[mid])];
    } else if (cmp > 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (forSplice) {
    const isFoundInside: boolean = (
      left < tokens.length
      && positionIsStrictlyInsideToken(position, tokens[left])
    );
    return [left, isFoundInside];
  } else {
    return [-1, false];
  }
};
