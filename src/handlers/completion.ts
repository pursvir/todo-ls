import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  Connection,
  TextDocumentPositionParams,
  TextDocuments,
} from "vscode-languageserver";
import { Position, TextDocument } from "vscode-languageserver-textdocument";

import { getRows } from "../parser/utils";
import {
  getTokenAtPosition,
  IndexedToken,
  tokenizeLine,
} from "../parser/tokenizer";

const completionKindMap: Map<string, number> = new Map<string, number>([
  ["@", CompletionItemKind.Function],
  ["+", CompletionItemKind.Interface],
]);

export const registerCompletionHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onCompletion((params: CompletionParams): CompletionItem[] => {
    const completionSet: Set<string> = new Set<string>();

    const doc: TextDocument = documents.get(params.textDocument.uri);
    if (!doc) return [];

    const position: Position = params.position;
    let rows: string[] = getRows(doc.getText());
    const currentLineTokens: IndexedToken[] = tokenizeLine(rows[position.line]);
    const currentToken: string = getTokenAtPosition(
      currentLineTokens,
      position.character,
    ).token;

    let triggerChars: string;
    if (params.context.triggerKind === 2) {
      triggerChars = params.context.triggerCharacter;
      if (currentToken !== triggerChars) {
        triggerChars = currentToken;
      }
    } else if (params.context.triggerKind === 1) {
      triggerChars = currentToken;
      fillSetWithNeededTokens(completionSet, currentLineTokens, triggerChars);
      rows = [
        ...rows.slice(0, position.line),
        ...rows.slice(position.line + 1),
      ];
    }
    rows.forEach((row: string) => {
      fillSetWithNeededTokens(completionSet, tokenizeLine(row), triggerChars);
    });

    return Array.from(completionSet).map(
      (word: string): CompletionItem => ({
        label: word,
        kind: completionKindMap.get(triggerChars[0]) as CompletionItemKind,
        textEdit: {
          range: {
            start: { line: position.line, character: position.character - 1 },
            end: { line: position.line, character: position.character },
          },
          newText: word,
        },
      }),
    ) as CompletionItem[];
  });
};

const fillSetWithNeededTokens = (
  set: Set<string>,
  tokens: IndexedToken[],
  triggerChar: string,
): void => {
  tokens.forEach((token: IndexedToken) => {
    if (token.token.startsWith(triggerChar)) {
      set.add(token.token);
    }
  });
};
