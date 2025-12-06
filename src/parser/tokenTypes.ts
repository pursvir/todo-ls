import { SemanticTokensLegend } from "vscode-languageserver";

/* Not vscode's SemanticTokens, but similar. */
export interface Token {
  line: number;
  character: number;
  content: string;
  tokenType: number;
  tokenModifiers: number;
}

const TokenPatternTypes = [
  "description",
  "priority",
  "date",
  "completionMark",
  "project",
  "context",
  "keyValue",
] as const;

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
