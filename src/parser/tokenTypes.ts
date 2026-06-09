import { SemanticTokensLegend, uinteger } from "vscode-languageserver";

/**
 * Text token object interface.
 * Mostly similar to vscode-languageserver's SemanticToken, but some fields were changed.
 */
export interface Token {
  line: uinteger;
  character: uinteger;
  content: string;
  tokenType: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PatternTypes: string[] = [
  "common",
  "priority",
  "date",
  "completionMark",
  "project",
  "context",
  "keyValue",
] as const;

export type PatternType = (typeof PatternTypes)[number];

export const BEGINNING_TOKEN_PATTERNS: PatternType[] = [
  "priority",
  "completionMark",
] as const;

export const TodotxtTokenTypes: PatternType[] = [
  "common",
  "priority",
  "creationDate",
  "completionDate",
  "completionMark",
  "project",
  "context",
  "keyValue",
] as const;

export const legend: SemanticTokensLegend = {
  tokenTypes: TodotxtTokenTypes,
  tokenModifiers: [],
};

/**
 * A type which represents one of possible todo.txt token types which are described in the [standard](https://github.com/todotxt/todo.txt).
 */
export type TodotxtTokenType = (typeof TodotxtTokenTypes)[number];
