import { SemanticTokensLegend, uinteger } from "vscode-languageserver";

/* Not vscode's SemanticTokens, but similar. */
export interface Token {
  line: uinteger;
  character: uinteger;
  content: string;
  tokenType: number; // TODO: add constraints
  tokenModifiers: number;
}

const TokenPatternTypes = [ // eslint-disable-line @typescript-eslint/no-unused-vars
  "description",
  "priority",
  "date",
  "completionMark",
  "project",
  "context",
  "keyValue",
];

export type TokenPatternType = (typeof TokenPatternTypes)[number];

export const BEGINNING_TOKEN_PATTERNS: TokenPatternType[] = [
  "priority",
  "completionMark",
];

export const TodotxtTokenTypes = [
  "description",
  "priority",
  "creationDate",
  "completionDate",
  "completionMark",
  "project",
  "context",
  "keyValue",
];

export const legend: SemanticTokensLegend = {
  tokenTypes: TodotxtTokenTypes,
  tokenModifiers: [],
};

export type TodotxtTokenType = (typeof TodotxtTokenTypes)[number];
