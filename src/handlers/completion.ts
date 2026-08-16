import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  Connection,
  Position,
  Range,
  TextDocuments,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
  getPositionIndex,
  TokenPointer,
} from "../utils/tokenUtils";
import { PatternType, TodotxtTokenType, Token } from "../parser/tokenTypes";
import { generateISODate } from "../utils/dateUtils";
import { storage } from "../server";
import {
  COMPLETION_MARK_RE,
  CONTEXT_SYMBOL_RE,
  DATE_CONTAINING_RE,
  INCOMPLETE_DATE_BEGINNING_RE,
  INCOMPLETE_PRIORITY_BEGINNING_RE,
  PRIORITY_CONTAINING_RE,
  PRIORITY_RE,
  PROJECT_SYMBOL_RE,
} from "../parser/regexps";


// TODO: make those kinds configurable
const kindMap: Map<PatternType, number> = new Map<PatternType, number>([
  [PatternType.Priority, CompletionItemKind.Keyword],
  [PatternType.Project, CompletionItemKind.Interface],
  [PatternType.Context, CompletionItemKind.Color],
  [PatternType.KeyValue, CompletionItemKind.Keyword]
]);


/** Intended creation date token character offset inside the line representing a task with priority. */
const CREATION_DATE_AFTER_PRIORITY_CHAR: number = 4;
/** Intended creation date token character offset inside the line representing completed task with completion date specified. */
const CREATION_DATE_AFTER_COMPLETION_DATE_CHAR: number = 13;
/** Intended completion date token character offset inside the line representing completed task. */
const COMPLETION_DATE_AFTER_COMPLETION_MARK_CHAR: number = 2;


const getKind = (pattern: PatternType | undefined): CompletionItemKind => {
  let result: number = 0;
  if (pattern === undefined) return result as CompletionItemKind;

  let kind: number | undefined;
  if ((kind = kindMap.get(pattern)) !== undefined)
    result = kind;

  return result as CompletionItemKind;
};

const generatePriorityItems = (insertPos: Position, offset: number = 0): CompletionItem[] => {
  // TODO: define priority set via config options
  return ["A", "B", "C", "D"].map(
    (letter: string) => {
      const label: string = `(${letter}) `;
      return {
        label: label,
        detail: "priority",
        textEdit: {
          range: {
            start: insertPos,
            end: insertPos,
          },
          newText: `(${letter}) `.slice(offset),
        }
      };
    },
  );
}

// TODO: correct max months for each month number
function generateMaxDate(prefix: string): string {
  let result: string = prefix;
  const len = prefix.length;

  for (let i: number = len; i < 4; i++)
    result += "9";
  if (len < 5)
    result += "-";
  if (len < 6)
    result += "1";
  if (len < 7)
    result += "2";
  if (len < 8)
    result += "-";
  if (len < 9)
    result += "3";
  if (len < 10)
    result += "1";

  return result;
}

function generateMinDate(prefix: string): string {
  let result: string = prefix;
  const len: number = prefix.length;

  for (let i: number = len; i < 4; i++)
    result += "0";
  if (len < 5)
    result += "-";
  if (len < 6)
    result += "0";
  if (len < 7)
    result += "1";
  if (len < 8)
    result += "-";
  if (len < 9)
    result += "0";
  if (len < 10)
    result += 1;

  return result;
}

// TODO: we should cache this
/**
 * Returns list of `CompletionItem`s with ISO 8601 date texts.
 * If current token's prefix is today date, returns today, tomorrow and each day before until a week ago.
 */
const generateDateItems = (
  datePart: string,
  insertPos: Position,
  offset: number,
  prefix: string = "",
): CompletionItem[] => {
  const range: Range = {
    start: insertPos,
    end: insertPos,
  };
  const today: string = generateISODate();
  const commonPrefix: string = today.slice(0, datePart.length);

  // TODO: should we provide more completion items in those cases?
  if (datePart > commonPrefix) {
    const minDt = generateMinDate(datePart);
    return [{
      label: minDt,
      detail: "future",
      textEdit: {
        range: range,
        newText: `${minDt} `.slice(offset),
      }
    }];
  } else if (datePart < commonPrefix) {
    const maxDt: string = generateMaxDate(datePart);
    return [{
      label: maxDt,
      detail: "from history",
      textEdit: {
        range: range,
        newText: `${maxDt} `.slice(offset),
      }
    }];
  }

  return [
    ...[[today, "today"], [generateISODate(1), "tomorrow"]]
      .map((elem: string[], i: number): CompletionItem => {
        const text: string = `${prefix}${elem[0]}`;
        return {
          label: text,
          detail: elem[1],
          sortText: `${i}`,
          textEdit: {
            range: range,
            newText: `${text} `.slice(offset),
          }
        }
      }
    ),
    ...Array.from({ length: 8 }, (_, i: number) => i + 1)
      .map((i: number): CompletionItem => {
        const text: string = `${prefix}${generateISODate(-i)}`;
        return {
          label: text,
          detail: "from history",
          sortText: `${i + 1}`,
          textEdit: {
            range: range,
            newText: `${text} `.slice(offset),
          }
        }
      })
  ];
};

const isTypedAsFirst = (idx: number, token: Token): boolean => {
  return idx === 0 && token.character === 0;
}

const getProbableKeys = (doc: TextDocument, text: string): Set<string> => {
  const res: Set<string> = new Set<string>();

  const keys: Set<string> | undefined = storage.getKeysOf(doc);
  if (!keys)
    return res;

  for (const key of keys) {
    if (key.startsWith(text)) {
      res.add(key);
    }
  }

  return res;
}

export const registerCompletionHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onCompletion((params: CompletionParams): CompletionItem[] => {
    // TODO: is it possible to make todo-ls not conflict with IDE's built-in completions (when just typing letters)?

    if (params.context?.triggerKind === 3) {
      // unsupported.
      return [];
    }

    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];

    const tokens: Token[][] = storage.get(doc);
    if (!tokens) return [];

    let completionTriggerType: PatternType = PatternType.Common;

    const tokenPtr: TokenPointer = getPositionIndex(tokens[params.position.line], params.position);

    const currentToken: Token = tokens[params.position.line][tokenPtr.index];

    let datePrefix: string = "";
    let offset: number = 0;

    let itemSet: Set<string> = new Set<string>();

    if (params.context?.triggerKind === 2) {
      const triggerChar: string | undefined = params.context?.triggerCharacter;
      if (triggerChar === undefined) return [];

      if (triggerChar === "(") {
        if (params.position.character === 1) {
          completionTriggerType = PatternType.Priority;
        } else {
          completionTriggerType = PatternType.Common;
        }
      } else if (PROJECT_SYMBOL_RE.test(triggerChar)) {
        completionTriggerType = PatternType.Project;
      } else if (CONTEXT_SYMBOL_RE.test(triggerChar)) {
        completionTriggerType = PatternType.Context;
      }
    } else if (params.context?.triggerKind === 1) {
      switch (currentToken.tokenType) {
        case TodotxtTokenType.Project:
          completionTriggerType = PatternType.Project;
          break;
        case TodotxtTokenType.Context:
          completionTriggerType = PatternType.Context;
          break;
        default:
          const idxOnLine: number = getPositionIndex(tokens[params.position.line], params.position, false).index;
          let match: RegExpMatchArray | null;

          if (
            (match = currentToken.content.match(INCOMPLETE_PRIORITY_BEGINNING_RE)) !== null
            && (
              isTypedAsFirst(idxOnLine, currentToken)
              || (
                tokens[params.position.line].length === 1
                || (
                  tokens[params.position.line].length > 1
                  && (
                    (!(PRIORITY_CONTAINING_RE.test(currentToken.content)))
                    && (!(PRIORITY_RE.test(tokens[params.position.line][1].content)))
                  )
                )
              )
            )
          ) {
            // @ts-expect-error
            offset = match.groups.priorBegin.length;
            completionTriggerType = PatternType.Priority;
          } else if (
            (match = currentToken.content.match(INCOMPLETE_DATE_BEGINNING_RE)) !== null
            && ((
              isTypedAsFirst(idxOnLine, currentToken)
              && (!DATE_CONTAINING_RE.test(currentToken.content))
            ) || (
                tokens[params.position.line].length === 1
                || (
                  idxOnLine === 1
                  && (
                    (tokens[params.position.line][0].tokenType === TodotxtTokenType.Priority
                      && currentToken.character === CREATION_DATE_AFTER_PRIORITY_CHAR)
                    || (
                      COMPLETION_MARK_RE.test(tokens[params.position.line][0].content)
                      && currentToken.character === COMPLETION_DATE_AFTER_COMPLETION_MARK_CHAR)
                  )
                ) || (
                  idxOnLine === 2
                  && currentToken.character === CREATION_DATE_AFTER_COMPLETION_DATE_CHAR
                  && tokens[params.position.line][1].tokenType === TodotxtTokenType.CompletionDate
                )
              )
            )
          ) {
            completionTriggerType = PatternType.Date;
            offset = match[0].length;
          // TODO: we can handle key-value's values. But how?
          } else {
            itemSet = getProbableKeys(doc, currentToken.content);
            if (
              itemSet.size !== 0
            ) {
              completionTriggerType = PatternType.KeyValue;
            } else {
              completionTriggerType = PatternType.Common;
            }
          }
      }
    }

    let detail: string;
    let isProjOrCtx: boolean = true;

    const insertPos: Position = {
      line: currentToken.line,
      character: currentToken.character + offset
    };

    switch (completionTriggerType) {
      case PatternType.Priority:
        return generatePriorityItems(insertPos, offset);
      case PatternType.Date:
        // TODO: may return invalid dates, e.g. 2020-22-33
        //  set up some validity checker
        return generateDateItems(
          currentToken.content, insertPos,
          offset, datePrefix
        );
      case PatternType.Project:
        detail = "project tag";
        break;
      case PatternType.Context:
        detail = "context tag";
        break;
      case PatternType.KeyValue:
        detail = "key-value tag";
        isProjOrCtx = false;
        break;
      default:
        // shouldn't be here.
        return [];
    }

    const kind: CompletionItemKind = getKind(completionTriggerType);

    if (isProjOrCtx) {
      const itemSet_: Set<string> | undefined =
        completionTriggerType === PatternType.Project
        ? storage.getProjsOf(doc)
        : storage.getCtxsOf(doc);

      if (!itemSet_)
        return [];

      // A dumb solution to prevent including "@" and "+" on their own into completion items list.
      // Don't understand yet, where it's appeared there from...
      for (const item of itemSet_) {
        if (item.length === 1) itemSet_.delete(item);
      }

      itemSet = itemSet_;
    }

    return Array.from(itemSet).map((word: string): CompletionItem => {
      return {
        label: word,
        detail: detail,
        kind: kind,
        // TODO: why does it behave like this ??
        insertText: isProjOrCtx ? word.slice(1) : word,
      } satisfies CompletionItem;
    }) satisfies CompletionItem[];
  });
};
