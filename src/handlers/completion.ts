import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  Connection,
  // Position,
  TextDocuments,
} from "vscode-languageserver";

import { TextDocument } from "vscode-languageserver-textdocument";
import {
  getDocTokens,
  // getIndexAtPosition,
  // TokenPointer,
} from "../utils/tokenUtils";
import { Token } from "../parser/tokenTypes";
import { TokenTypeRepr } from "../parser/tokenTypeReprs";
import { generateISODate } from "../utils/dateUtils";

const findTokensWithPrefix = (
  tokens: Token[],
  prefix: string,
  candidates: Set<string>,
): void => {
  tokens.forEach((token: Token) => {
    if (token.content.indexOf(prefix) === 0) {
      candidates.add(token.content);
    }
  });
};

export const firstYearDigit: string = generateISODate().slice(0, 1);

// TODO: choose kinds which are most suitable.
const kindMap: Map<string, number> = new Map<string, number>([
  ["@", CompletionItemKind.Interface],
  ["+", CompletionItemKind.Color],
  // TODO: achieve key-value tag highlighting.
]);

const getKind = (char: string | undefined): CompletionItemKind => {
  let result: number = 0;
  if (char === undefined) return result as CompletionItemKind;
  for (const [pattern, kind] of kindMap) {
    if (char === pattern) {
      result = kind;
      break;
    }
  }
  return result as CompletionItemKind;
};

/**
 * Generate CompletionItem's with ISO 8601 dates, corresponding to today, tomorrow and for each day until a week ago.
 */
const generateDateCompletionItems = (prefix: string = ""): CompletionItem[] => {
  let completionItems: CompletionItem[] = [
    {
      label: `${prefix}${generateISODate()}`,
      detail: "today",
    },
    {
      label: `${prefix}${generateISODate()}`,
      detail: "tomorrow",
    },
  ];
  // TODO: those are not pasted inside the list...
  for (let i = -1; i < -8; i--) {
    completionItems.push({
      label: `${prefix}${generateISODate(i)}`,
      detail: "from history",
    });
  }
  // connection.console.debug(`${completionItems}`);
  return completionItems;
};

export const registerCompletionHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onCompletion((params: CompletionParams): CompletionItem[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const tokens = getDocTokens(doc);

    // const position: Position = params.position;
    // const tokenPtr: TokenPointer = getIndexAtPosition(tokens, position);
    // const currentToken = tokens[tokenPtr.index];

    let completionSet: Set<string> = new Set<string>();
    let isCreationDateTrigger: boolean = false;
    let isCompDateTrigger: boolean = false;
    let commonLabel: TokenTypeRepr;

    let triggerChar: string | undefined;

    if (params.context?.triggerKind === 2) {
      connection.console.debug(
        `Completion trigger kind 2, char: ${params.context.triggerCharacter}`,
      );
      triggerChar = params.context.triggerCharacter;
      if (triggerChar) {
        if (triggerChar === "x" && params.position.character === 1) {
          isCompDateTrigger = true;
        } else if (triggerChar === firstYearDigit) {
          isCreationDateTrigger = true;
        } else {
          findTokensWithPrefix(tokens, triggerChar, completionSet);
          switch (triggerChar) {
            case "@":
              commonLabel = "context tag";
              break;
            case "+":
              commonLabel = "project tag";
              break;
          }
        }
      }
    }
    if (isCreationDateTrigger) return generateDateCompletionItems();
    if (isCompDateTrigger) return generateDateCompletionItems("x ");

    const kind = getKind(triggerChar);
    // TODO: key-value tags completions.
    return Array.from(completionSet).map((word: string): CompletionItem => {
      return {
        label: word,
        detail: commonLabel,
        kind: kind,
        // To prevent pasting "@@" or "++" when choosing one of items.
        // There is definitely a better way to achieve this, I'm sure.
        insertText: word.slice(1),
      } as CompletionItem;
    }) as CompletionItem[];
  });
};
