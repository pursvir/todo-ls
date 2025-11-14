const TokenTypes = [
  "completionMark",
  "priority",
  "date",
  "project",
  "context",
  "keyValue",
  "description",
] as const;

export type TokenType = (typeof TokenTypes)[number];

export const TodotxtTokenTypes = [
  "completionMark",
  "priority",
  "creationDate",
  "completionDate",
  "project",
  "context",
  "keyValue",
  "description",
] as const;

export type TodotxtTokenType = (typeof TodotxtTokenTypes)[number];
