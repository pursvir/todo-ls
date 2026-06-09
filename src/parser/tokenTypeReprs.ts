/** Human-readable representations of todo.txt token types which are used in LSP responses. */
export const tokenTypeReprs: string[] = [
  "description",
  "priority",
  "creation date",
  "completion date",
  "completion mark",
  "project tag",
  "context tag",
  "key-value tag",
] as const;

// `number` indexes correspond to `Token`'s `tokenType` field enumeration.
export type TokenTypeRepr = (typeof tokenTypeReprs)[number];
