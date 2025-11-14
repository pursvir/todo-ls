import { IndexedToken } from "../parser/tokenizer";
import {
  TodotxtTokenType,
  TodotxtTokenTypes,
  TokenType,
} from "../parser/tokenTypes";

export const tokenPatternMap: Map<TokenType, RegExp> = new Map<
  TokenType,
  RegExp
>([
  ["completionMark", /^x$/],
  ["priority", /^\([A-Z]\) *$/],
  ["date", /^\d{4}-\d{2}-\d{2}$/],
  ["project", /^\+\S+$/],
  ["context", /^@\S+$/],
  ["keyValue", /^[^:\s]+\:[^:\s]+$/],
]);

export const DATA_BEFORE_DESCRIPTION_RE: RegExp =
  /^(?:x(?: \d{4}-\d{2}-\d{2}){0,2} |(?:\([A-Z]\) )?(?:\d{4}-\d{2}-\d{2} )?)/;

const getTokenEnd = (token: IndexedToken): number => {
  return token.start + token.token.length - 1;
};

const determineTokenType = (token: string): TokenType => {
  for (const [type, regex] of tokenPatternMap) {
    if (regex.test(token)) return type;
  }
  return "description";
};

export const determineTodotxtTokenType = (
  token: IndexedToken,
  tokens: IndexedToken[],
): TodotxtTokenType => {
  let todotxtType: TodotxtTokenType;
  let tokenType: TokenType = determineTokenType(token.token);
  if (tokenType === "date") {
    const tokenIndex = tokens.indexOf(token);
    if (tokenIndex === 0) todotxtType = "creationDate";
    else if (tokenIndex === 1) {
      const previousToken = tokens[tokenIndex - 1];
      if (token.start - getTokenEnd(previousToken) === 2) {
        if (determineTokenType(previousToken.token) === "completionMark") {
          todotxtType = "completionDate";
        } else if (determineTokenType(previousToken.token) === "priority") {
          todotxtType = "creationDate";
        }
      } else {
        todotxtType = "description";
      }
    } else if (tokenIndex === 2) {
      const previousToken = tokens[tokenIndex - 1];
      const firstToken = tokens[tokenIndex - 2];
      if (
        token.start - getTokenEnd(previousToken) === 2 &&
        previousToken.start - getTokenEnd(firstToken) === 2 &&
        determineTokenType(previousToken.token) === "date" &&
        determineTokenType(firstToken.token) === "completionMark"
      ) {
        todotxtType = "creationDate";
      } else {
        todotxtType = "description";
      }
    } else {
      todotxtType = "description";
    }
  } else {
    todotxtType = tokenType as TodotxtTokenType;
  }
  return todotxtType;
};

export const getDescriptionStart = (row: string): number => {
  const dataMatch = row.match(DATA_BEFORE_DESCRIPTION_RE);
  return dataMatch ? dataMatch[0].length : 0;
};
