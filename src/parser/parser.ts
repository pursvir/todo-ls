import { beginningTokenPatternToTypeMap, Token, tokenPatternToTypeMap } from "./tokenTypes";
import { TodotxtTokenType, PatternType } from "./tokenTypes";
import {
  COMPLETION_MARK_RE,
  CONTEXT_RE,
  DATE_RE,
  KV_RE,
  PRIORITY_RE,
  PROJECT_RE,
} from "./regexps";
import { getTokenEnd } from "../utils/tokenUtils";


export const tokenPatternMap: Map<PatternType, RegExp> = new Map<
  PatternType,
  RegExp
>([
  [PatternType.Priority, PRIORITY_RE],
  [PatternType.Project, PROJECT_RE],
  [PatternType.Context, CONTEXT_RE],
  [PatternType.Date, DATE_RE],
  [PatternType.KeyValue, KV_RE],
  [PatternType.CompletionMark, COMPLETION_MARK_RE],
]);

/**
 * Returns determined pattern type of token.
 */
export function determinePatternType(token: string): PatternType {
    for (const [type, regex] of tokenPatternMap) {
        if (regex.test(token)) return type;
    }
    return PatternType.Common;
}

/**
 * Returns numeric representation of a token type, based on its surrounding context (`line`, `character` and previous `Token[]`'s).
 */
export function determineTokenType(content: string,
    character: number,
    tokens: Token[]): TodotxtTokenType {
    let todotxtType: TodotxtTokenType;
    const idxOnLine: number = tokens.length;
    let tokenPatternType: PatternType = determinePatternType(content);

    if (tokenPatternType === PatternType.Date) {
        if (character === 0) {
            todotxtType = TodotxtTokenType.CreationDate;
        } else if (idxOnLine === 1) {
            const previousToken: Token = tokens[idxOnLine - 1];
            if (character - getTokenEnd(previousToken) === 1) {
                const previousTokenTypeName: TodotxtTokenType = previousToken.tokenType;
                if (previousTokenTypeName === TodotxtTokenType.CompletionMark) {
                    todotxtType = TodotxtTokenType.CompletionDate;
                } else if (previousTokenTypeName === TodotxtTokenType.Priority) {
                    todotxtType = TodotxtTokenType.CreationDate;
                } else {
                    todotxtType = TodotxtTokenType.Common;
                }
            } else {
                todotxtType = TodotxtTokenType.Common;
            }
        } else if (idxOnLine === 2) {
            const secondToken: Token = tokens[idxOnLine - 1];
            const firstToken: Token = tokens[idxOnLine - 2];
            if (character - getTokenEnd(secondToken) === 1 &&
                secondToken.tokenType === TodotxtTokenType.CompletionDate &&
                secondToken.character - getTokenEnd(firstToken) === 1 &&
                firstToken.tokenType === TodotxtTokenType.CompletionMark) {
                todotxtType = TodotxtTokenType.CreationDate;
            } else {
                todotxtType = TodotxtTokenType.Common;
            }
        } else {
            todotxtType = TodotxtTokenType.Common;
        }
    } else {
        let todotxtType_: TodotxtTokenType | undefined;
        if ((todotxtType_ = beginningTokenPatternToTypeMap.get(tokenPatternType))
            === undefined) {
            if ((todotxtType_ = tokenPatternToTypeMap.get(tokenPatternType)) === undefined) {
                todotxtType = TodotxtTokenType.Common;
            } else {
                todotxtType = todotxtType_;
            }
        } else {
            if (character === 0) {
                todotxtType = todotxtType_;
            } else {
                todotxtType = TodotxtTokenType.Common;
            }
        }
    }

    return todotxtType;
}
