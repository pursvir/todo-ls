import { Token } from "../parser/tokenTypes";
import { Position, Range } from "vscode-languageserver";
import { KEY_WITH_COLON_RE, KV_RE } from "../parser/regexps";

/**
 * A helper function which returns `token`'s character end.
 */
export function getTokenEnd(token: Token): number {
  return token.character + token.content.length;
};

/**
 * Return a `Range` which `token` takes.
 */
export function tokenRange(token: Token): Range {
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
 * Returns a `Range` between `token1` and `token2`.
 */
export function rangeBetweenTokens(
  token1: Token,
  token2: Token,
): Range {
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

/** Returns a `Range` which the `line` takes. */
export function lineRange(tokens: Token[], line: number): Range {
    if (tokens.length === 0) {
        return {
            start: {
                line: line,
                character: 0,
            }, end: {
                line: line,
                character: 0,
            }
        };
    }
    return {
        start: {
            line: tokens[0].line,
            character: 0,
        }, end: {
            line: line,
            character: getTokenEnd(tokens[tokens.length - 1])
        }
    };
}

function cmp(position: Position, token: Token): number {
    return (
        token.character <= position.character &&
        position.character <= getTokenEnd(token)
    )
        ? 0
        : position.character - token.character;
}

/**
 * Returns if `position` is pointing to some of the `Token[]`s (not in "whitespace" area of the document).
 */
export function positionIsInsideToken(position: Position,
    token: Token): boolean {
    return !cmp(position, token);
}

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
export function getPositionIndex(
  lineTokens: Token[],
  position: Position,
  forSplice: boolean = true
): TokenPointer {
    if (lineTokens.length === 0) {
        return {
            index: 0,
            isInsideToken: false,
        } satisfies TokenPointer;
    }

    let left: number = 0;
    let right = lineTokens.length - 1;

    // Binary search adaptation for token list,
    // which supports both searching of existing element index and insertion one.
    while (left <= right) {
        let mid: number = Math.floor((left + right) / 2);

        const cmp_: number = cmp(position, lineTokens[mid]);
        if (cmp_ === 0) {
            return {
                index: mid,
                isInsideToken: true,
            } as TokenPointer;
        } else if (cmp_ > 0) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (forSplice) {
        const isInside: boolean = left < lineTokens.length && positionIsInsideToken(position, lineTokens[left]);
        return { index: left, isInsideToken: isInside };
    } else {
        return { index: -1, isInsideToken: false };
    }
}

export function getKey(token: Token): string {
  // @ts-expect-error
  return token.content.match(KEY_WITH_COLON_RE)[0];
}

export interface KeyValueSchema {
  key: string,
  value: string
};

export function getKeyValue(token: Token): KeyValueSchema {
  const match = token.content.match(KV_RE);
  if (!match || (!match.groups))
    throw new Error("Not a key-value tag!");

  return {
    key: match.groups.key,
    value: match.groups.value,
  };
}

export function getTokenUnderPosition(tokens: Token[][], position: Position): Token | undefined {
  const tokenPtr: TokenPointer = getPositionIndex(tokens[position.line], position);
  const currentToken: Token = tokens[position.line][tokenPtr.index];

  return currentToken;
}
