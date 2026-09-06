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
  KV_RE,
  PRIORITY_CONTAINING_RE,
  PRIORITY_RE,
  PROJECT_SYMBOL_RE,
} from "../parser/regexps";

enum CompletionType {
  Common = 0,
  Priority = 1,
  Date = 2,
  CompletionMark = 3,
  Project = 4,
  Context = 5,
  Key = 6,
  Value = 7,
};

// TODO: make those kinds configurable via user's config
const kindMap: Map<CompletionType, number> = new Map<CompletionType, number>([
  [CompletionType.Priority, CompletionItemKind.Keyword],
  [CompletionType.Project, CompletionItemKind.Interface],
  [CompletionType.Context, CompletionItemKind.Color],
  [CompletionType.Key, CompletionItemKind.Keyword],
  [CompletionType.Value, CompletionItemKind.Keyword],
]);

/** Intended creation date token character offset inside the line representing a task with priority. */
const CREATION_DATE_AFTER_PRIORITY_CHAR: number = 4;
/** Intended creation date token character offset inside the line representing completed task with completion date specified. */
const CREATION_DATE_AFTER_COMPLETION_DATE_CHAR: number = 13;
/** Intended completion date token character offset inside the line representing completed task. */
const COMPLETION_DATE_AFTER_COMPLETION_MARK_CHAR: number = 2;


function getKind(pattern: CompletionType | undefined): CompletionItemKind {
  let result: number = 0;
  if (pattern === undefined) return result as CompletionItemKind;

  let kind: number | undefined;
  if ((kind = kindMap.get(pattern)) !== undefined)
    result = kind;

  return result as CompletionItemKind;
}

function generatePriorityItems(
  insertPos: Position, offset: number = 0,
  suffix: string = " ",
): CompletionItem[] {
  // TODO: define priority range via config options
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
          newText: `(${letter})${suffix}`.slice(offset),
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
    result += "1";

  return result;
}

// TODO: we should cache this
/**
 * Returns list of `CompletionItem`s with ISO 8601 date texts.
 * If current token's prefix is today date, returns today, tomorrow and each day before until a week ago.
 */
function generateDateItems(
  datePart: string,
  insertPos: Position,
  offset: number,
  prefix: string = "",
  suffix: string = " ",
): CompletionItem[] {
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
        newText: `${minDt}${suffix}`.slice(offset),
      }
    }];
  } else if (datePart < commonPrefix) {
    const maxDt: string = generateMaxDate(datePart);
    return [{
      label: maxDt,
      detail: "from history",
      textEdit: {
        range: range,
        newText: `${maxDt}${suffix}`.slice(offset),
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
            newText: `${text}${suffix}`.slice(offset),
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
            newText: `${text}${suffix}`.slice(offset),
          }
        }
      })
  ];
}

/**
 * Returns set of key strings with semiconols with `text` prefix,
 * based on existing key-value tags in the `doc` TextDocument.
 */
function getProbableKeys(doc: TextDocument, text: string): Set<string> {
  const res: Set<string> = new Set<string>();

  const kvs: Map<string, Set<string>> | undefined = storage.getKeysOf(doc);
  if (!kvs)
    return res;

  for (const key of kvs.keys()) {
    if (key.startsWith(text))
      res.add(`${key}:`);
  }

  return res;
}

/**
 * Returns existing values for `key`,
 * based on existing key-value tags in the `doc` TextDocument.
 */
function getValuesForKey(doc: TextDocument, key: string): Set<string> {
  let res: Set<string> | undefined = new Set<string>();

  const kvs: Map<string, Set<string>> | undefined = storage.getKeysOf(doc);
  if (!kvs)
    return res;

  if ((res = kvs.get(key)) === undefined) {
    return new Set<string>();
  } else {
    return res;
  }
}

function isTypedAsFirst(idx: number, token: Token): boolean {
  return idx === 0 && token.character === 0;
}

export function registerCompletionHandler(connection: Connection,
  documents: TextDocuments<TextDocument>): void {
  connection.onCompletion((params: CompletionParams): CompletionItem[] => {
    if (params.context?.triggerKind === 3) {
      // unsupported.
      return [];
    }

    const doc: TextDocument | undefined = documents.get(params.textDocument.uri);
    if (!doc) return [];

    const tokens: Token[][] = storage.get(doc);
    if (!tokens) return [];

    let completionTriggerType: CompletionType = CompletionType.Common;

    const tokenPtr: TokenPointer = getPositionIndex(tokens[params.position.line], params.position);
    const currentToken: Token = tokens[params.position.line][tokenPtr.index];

    let datePrefix: string = "";
    let offset: number = 0;
    let noWhitespaceRequired: boolean;

    let itemSet: Set<string> = new Set<string>();

    if (params.context?.triggerKind === 2) {
      const triggerChar: string | undefined = params.context?.triggerCharacter;
      if (triggerChar === undefined) return [];

      if (triggerChar === "(") {
        if (params.position.character === 1) {
          completionTriggerType = CompletionType.Priority;
        } else {
          completionTriggerType = CompletionType.Common;
        }
        // if triggerCharacter is the first typed symbol
      } else if (currentToken.content.length === 1) {
        if (PROJECT_SYMBOL_RE.test(triggerChar)) {
          completionTriggerType = CompletionType.Project;
        } else if (CONTEXT_SYMBOL_RE.test(triggerChar)) {
          completionTriggerType = CompletionType.Context;
        } else {
          completionTriggerType = CompletionType.Common;
        }
      } else {
        completionTriggerType = CompletionType.Common;
      }
    } else if (params.context?.triggerKind === 1) {
      switch (currentToken.tokenType) {
        case TodotxtTokenType.Project:
          completionTriggerType = CompletionType.Project;
          break;
        case TodotxtTokenType.Context:
          completionTriggerType = CompletionType.Context;
          break;
        default:
          const idxOnLine: number = getPositionIndex(tokens[params.position.line], params.position, false).index;
          let match: RegExpMatchArray | null;

          if ((match = currentToken.content.match(INCOMPLETE_PRIORITY_BEGINNING_RE)) !== null
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
            )) {
            // @ts-expect-error
            offset = match.groups.priorBegin.length;
            completionTriggerType = CompletionType.Priority;
            noWhitespaceRequired = (
              (tokenPtr.index === 0 && tokens[currentToken.line].length > 1)
              // @ts-expect-error
              && !(match.groups.priorBegin.length === currentToken.content.length)
            );
          } else if ((match = currentToken.content.match(INCOMPLETE_DATE_BEGINNING_RE)) !== null
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
            )) {
            completionTriggerType = CompletionType.Date;
            offset = match[0].length;
            noWhitespaceRequired = (
              (tokenPtr.index === 0 && tokens[currentToken.line].length > 1)
              || (
                // For creaton and completion dates.
                [1, 2].includes(tokenPtr.index)
                && tokens[currentToken.line].length > 2
                && tokens[currentToken.line][2].character >= 4
              )
            );
          } else if ((itemSet = getProbableKeys(doc, currentToken.content)).size !== 0) {
            completionTriggerType = CompletionType.Key;
          } else if (currentToken.tokenType === TodotxtTokenType.KeyValue) {
            completionTriggerType = CompletionType.Value;
            itemSet = getValuesForKey(doc,
              // @ts-expect-error
              currentToken.content.match(KV_RE).groups.key);
          } else {
            completionTriggerType = CompletionType.Common;
          }
      }
    }

    let detail: string;
    /** Is either a project or a context. */
    let isPrefixedMetadata: boolean = true;

    const insertPos: Position = {
      line: currentToken.line,
      character: currentToken.character + offset
    };

    switch (completionTriggerType) {
      // TODO: make completions for each token type configurable via user's config.
      case CompletionType.Priority:
        // @ts-expect-error
        return generatePriorityItems(insertPos, offset, noWhitespaceRequired ? "" : " ");
      case CompletionType.Date:
        // TODO: may return invalid dates, e.g. 2020-22-33
        //  set up some validity checker
        return generateDateItems(
          currentToken.content, insertPos,
          offset, datePrefix,
          // @ts-expect-error
          noWhitespaceRequired ? "" : " "
        );
      case CompletionType.Project:
        detail = "project tag";
        break;
      case CompletionType.Context:
        detail = "context tag";
        break;
      case CompletionType.Key:
        detail = "key-value tag";
        isPrefixedMetadata = false;
        break;
      case CompletionType.Value:
        detail = "key-value tag";
        isPrefixedMetadata = false;
        break;
      default:
        // shouldn't be here.
        return [];
    }

    const kind: CompletionItemKind = getKind(completionTriggerType);

    if (isPrefixedMetadata) {
      const itemSet_: Set<string> | undefined = completionTriggerType === CompletionType.Project
        ? storage.getProjsOf(doc)
        : storage.getCtxsOf(doc);

      if (!itemSet_)
        return [];

      // A dumb solution to prevent including "@" and "+" on their own into completion items list.
      // Don't understand yet, where it's appeared there from...
      // TODO: get rid of this.
      // for (const item of itemSet_) {
      //   if (item.length === 1) itemSet_.delete(item);
      // }

      itemSet = itemSet_;
    }

    return Array.from(itemSet).map((word: string): CompletionItem => {
      return {
        label: word,
        detail: detail,
        kind: kind,
        // TODO: why does it behave like this ??
        insertText: isPrefixedMetadata ? word.slice(1) : word,
      } satisfies CompletionItem;
    }) satisfies CompletionItem[];
  });
}
