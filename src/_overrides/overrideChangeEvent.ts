import { Range } from "vscode-languageserver";

/* If original TextDocumentContentChangeEvent from vscode-languageserver module had been used,
TypeScript would have thrown many false errors: "Property range does not exist on type TextDocumentContentChangeEvent." */

export type TextDocumentContentChangeEvent = {
  range: Range;
  text: string;
};
