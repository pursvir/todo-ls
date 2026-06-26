import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  Connection,
  Position,
  TextDocuments,
} from "vscode-languageserver";

import { TextDocument } from "vscode-languageserver-textdocument";
import {
  getDocTokens,
  getIndexAtPosition,
  TokenPointer,
} from "../utils/tokenUtils";
import { TodotxtTokenType, Token } from "../parser/tokenTypes";
import { TokenTypeRepr } from "../parser/tokenTypeReprs";
import { generateISODate } from "../utils/dateUtils";
import { decodeTokenType } from "../parser/tokenEncoder";
import { getIndexOnLine } from "../parser/utils";

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

const priorityCompletionItems: CompletionItem[] = ["A", "B", "C", "D"].map(
  (letter: string) => {
    return {
      label: `(${letter}) `,
      detail: "priority",
      insertText: `${letter}) `,
    };
  },
);

/**
 * Generate CompletionItem's with ISO 8601 dates, corresponding to today, tomorrow and for each day until a week ago.
 */
const generateDateCompletionItems = (
  prefix: string = "",
  // sliceStart: number = 0,
): CompletionItem[] => {
  const dtToday = generateISODate();
  const dtTomorrow = generateISODate(1);
  return [
    {
      label: `${prefix}${dtToday}`,
      detail: "today",
      sortText: "0",
      // insertText: dtToday.slice(sliceStart),
    },
    {
      label: `${prefix}${dtTomorrow}`,
      detail: "tomorrow",
      sortText: "1",
      // insertText: dtTomorrow.slice(sliceStart),
    },
    ...Array.from({ length: 8 }, (_, i: number) => i + 1)
      .map((i: number) => {
        const date: string = generateISODate(-i);
        return {
          label: `${prefix}${date}`,
          detail: "from history",
          sortText: `${i + 1}`,
          // insertText: date.slice(sliceStart),
        }
      })
  ];
};

export const registerCompletionHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onCompletion((params: CompletionParams): CompletionItem[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const tokens = getDocTokens(doc);

    const position: Position = params.position;
    const tokenPtr: TokenPointer = getIndexAtPosition(tokens, position);

    const currentToken = tokens[tokenPtr.index];
    connection.console.debug(`Current token: ${currentToken.content}`);

    let triggerChar: string | undefined;
    let completionTriggerType: TodotxtTokenType = "common";
    let sliceStart: number = 0;

    if (params.context?.triggerKind === 3) {
      // unsupported.
      return [];

      // typing new project/context/date/etc.
    } else if (params.context?.triggerKind === 2) {
      triggerChar = params.context?.triggerCharacter;

      if (triggerChar == undefined) return [];

      let triggerTypeDetected: boolean = false;
      if (params.position.character === 1) {
        if (triggerChar === "x") {
          completionTriggerType = "completionDate";
          triggerTypeDetected = true;
        } else if (triggerChar === "(") {
          completionTriggerType = "priority";
          triggerTypeDetected = true;
        } else if (triggerChar === firstYearDigit) {
          completionTriggerType = "creationDate";
          triggerTypeDetected = true;
        }
      }
      if (!triggerTypeDetected) {
        if (/^\+$/.test(triggerChar)) {
          completionTriggerType = "project";
        } else if (/^@$/.test(triggerChar)) {
          completionTriggerType = "context";
        }
      }
      // e.g. extending already existing project/context
    }
    else if (params.context?.triggerKind === 1) {
      triggerChar = currentToken.content;
      // TODO: not-full key-value tags
      //  TODO: we should cache possible key-values, those are the most trickiest tags.

      // TODO: not always, there are edge cases.
      completionTriggerType = decodeTokenType(currentToken.tokenType);

      sliceStart = currentToken.content.length - 1;

      // TODO: incorrect...
      let idxOnLine: number = getIndexOnLine(tokens, currentToken.line);

      // not-fully typed priorities, e.g. "(A".
      if (/^\([A-Z]$/.test(currentToken.content)) {
        return priorityCompletionItems;
      } else {
        if (
          // not fully-types dates
          /^[1-9]\d{3}-\d{2}-(?:\d|)&$/.test(currentToken.content)
          || /^[1-9]\d{3}-(?:\d{1,2}|)$/.test(currentToken.content)
          || /^\d{1,4}$/.test(currentToken.content)
          // TODO: typing hyphen `-` doesn't trigger any of completion kinds on the client side (at least, with Zed IDE).
          //  I guess I have to move this symbol to triggerKind 2 to make this work.
        ) {
          const previousTokenType: number = tokens[tokenPtr.index - 1].tokenType;
          if (
            // typing date first
            idxOnLine === 0
            // typing date after priority
            || (idxOnLine === 1 && previousTokenType === 1)
            // typing creation date after completion one on done tasks
            || (idxOnLine === 2 && (
              previousTokenType === 3
            ))
          ) {
            completionTriggerType = "creationDate";
          }
        }
      }
    }

    switch (completionTriggerType) {
      case "priority":
        return priorityCompletionItems;
      // TODO: we can cache those to prevent array mapping each time.
      // TODO: determine when we need to slice insertText...
      case "creationDate":
        return generateDateCompletionItems("");
      case "completionDate":
        return generateDateCompletionItems("x ");
      case "context":
      case "project":
        const detail: TokenTypeRepr =
          triggerChar === "@" ? "project tag" : "context tag";
        const kind: CompletionItemKind = getKind(triggerChar);
        const itemSet: Set<string> = new Set<string>();
        tokens.forEach((token: Token) => {
          // TODO: cache indexes of project, context and key-value tokens, maybe in a lazy way.
          // @ts-ignore TS2345
          if (token.content.indexOf(triggerChar) === 0) {
            itemSet.add(token.content);
          }
        });

        // A shitty solution to prevent including "@" and "+" on their own into completion items list.
        // Don't understand yet, where it's appeared from...
        for (const s of itemSet) {
          if (s.length === 1) itemSet.delete(s);
        }

        // TODO: key-value tags completions.
        return Array.from(itemSet).map((word: string): CompletionItem => {
          return {
            label: word,
            detail: detail,
            kind: kind,
            // To prevent including "@" or "+" symbols themselves.
            // There is definitely a better way to achieve this, I'm sure.
            insertText: word.slice(1),
          } as CompletionItem;
        }) as CompletionItem[];
      // common
      default:
        return [];
    }
  });
};
