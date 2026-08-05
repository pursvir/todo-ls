import { uinteger } from "vscode-languageserver";

/**
 * Text token object interface.
 * Mostly similar to vscode-languageserver's SemanticToken, but some fields were changed.
 */
export interface Token {
  /** 0-based line number. */
  line: uinteger;
  /** 0-based UTF-16 character offset within the line. */
  character: uinteger;
  /** Raw matched text. */
  content: string;
  /** Encoded token type. */
  tokenType: number;
}

export enum PatternType {
  Common = 0,
  Priority = 1,
  Date = 2,
  CompletionMark = 3,
  Project = 4,
  Context = 5,
  KeyValue = 6,
};

export enum TodotxtTokenType {
  Common = 0,
  Priority = 1,
  CreationDate = 2,
  CompletionDate = 3,
  CompletionMark = 4,
  Project = 5,
  Context = 6,
  KeyValue = 7,
};

export const beginningTokenPatternToTypeMap: Map<number, number> = new Map<number, number>([
  [PatternType.Priority, TodotxtTokenType.Priority],
  [PatternType.CompletionMark, TodotxtTokenType.CompletionMark],
]);

export const tokenPatternToTypeMap: Map<number, number> = new Map<number, number>([
  [PatternType.Project, TodotxtTokenType.Project],
  [PatternType.Context, TodotxtTokenType.Context],
  [PatternType.KeyValue, TodotxtTokenType.KeyValue],
])

export const TodotxtTokenTypes: string[] = [
  "description",
  "priority",
  "creation date",
  "completion date",
  "completion mark",
  "project",
  "context",
  "key-value"
];
