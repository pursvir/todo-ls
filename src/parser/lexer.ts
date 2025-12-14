import { BEGINNING_TOKEN_PATTERNS, Token } from "../parser/tokenTypes";
import { TodotxtTokenType, TokenPatternType } from "../parser/tokenTypes";
import {
	COMPLETION_MARK_RE,
	CONTEXT_RE,
	DATE_RE,
	KV_RE,
	PRIORITY_RE,
	PROJECT_RE,
} from "./regexps";
import { decodeTokenType, encodeTokenType } from "./utils";
import { getTokenEnd } from "../tokenctl/utils";

export const tokenPatternMap: Map<TokenPatternType, RegExp> = new Map<
	TokenPatternType,
	RegExp
>([
  ["completionMark", COMPLETION_MARK_RE],
  ["priority", PRIORITY_RE],
  ["date", DATE_RE],
  ["project", PROJECT_RE],
  ["context", CONTEXT_RE],
	["keyValue", KV_RE],
]);

const determineTokenType = (token: string): TokenPatternType => {
  for (const [type, regex] of tokenPatternMap) {
    if (regex.test(token)) return type;
  }
  return "description";
};

const getOnLineIndex = (tokens: Token[], tokenLine: number): number => {
  let onLineIndex: number;
  for (
    onLineIndex = tokens.length - 1;
    onLineIndex > -1 && tokens[onLineIndex]?.line === tokenLine;
    onLineIndex--
  ) {} // eslint-disable-line no-empty
  return tokens.length - 1 - onLineIndex;
};

export const determineTodotxtTokenType = (
	tokenContent: string,
	tokenLine: number,
	tokenChar: number,
	tokens: Token[],
): number => {
	let todotxtType: TodotxtTokenType;

	const onLineIndex: number = getOnLineIndex(tokens, tokenLine);
	let tokenPatternType: TokenPatternType = determineTokenType(tokenContent);
	if (tokenPatternType === "date") {
		if (tokenChar === 0) {
			todotxtType = "creationDate";
		} else if (onLineIndex === 1) {
			const previousToken: Token = tokens[onLineIndex - 1];
			if (tokenChar - getTokenEnd(previousToken) === 1) {
				const previousTokenTypeName: TodotxtTokenType = decodeTokenType(
					previousToken.tokenType,
				);
				if (previousTokenTypeName === "completionMark") {
					todotxtType = "completionDate";
				} else if (previousTokenTypeName === "priority") {
					todotxtType = "creationDate";
				} else {
					todotxtType = "description";
				}
			} else {
				todotxtType = "description";
			}
		} else if (onLineIndex === 2) {
			const secondToken: Token = tokens[onLineIndex - 1];
			const firstToken: Token = tokens[onLineIndex - 2];
			if (
				tokenChar - getTokenEnd(secondToken) === 1 &&
				decodeTokenType(secondToken.tokenType) === "completionDate" &&
				secondToken.character - getTokenEnd(firstToken) === 1 &&
				decodeTokenType(firstToken.tokenType) === "completionMark"
			) {
				todotxtType = "creationDate";
			} else {
				todotxtType = "description";
			}
		} else {
			todotxtType = "description";
		}
	} else {
		const beginningPatternIndex: number =
			BEGINNING_TOKEN_PATTERNS.indexOf(tokenPatternType);
		if (beginningPatternIndex === -1) {
			todotxtType = tokenPatternType as TodotxtTokenType;
		} else {
			if (tokenChar === 0)
				todotxtType = BEGINNING_TOKEN_PATTERNS[
					beginningPatternIndex
				] as TodotxtTokenType;
			else
				todotxtType = "description";
		}
	}
	return encodeTokenType(todotxtType);
};
