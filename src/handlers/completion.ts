import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
  Connection,
  TextDocuments,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { Token } from "../parser/tokenTypes";
import {
  getIndexAtPosition,
  positionIsInsideToken,
  retrieveDocTokens,
} from "../tokenctl/utils";
import { CONTEXT_RE, PROJECT_RE, KEY_WITH_COLON_RE } from "../parser/regexps";

const completionKindMap: Map<RegExp, number> = new Map<RegExp, number>([
  [CONTEXT_RE, CompletionItemKind.Function],
  [PROJECT_RE, CompletionItemKind.Interface],
  // TODO: keyValue suggestion highlighting.
]);

const getCompletionKind = (triggerChars: string): CompletionItemKind => {
  for (const [regexp, completionKind] of completionKindMap) {
    if (regexp.test(triggerChars)) return completionKind as CompletionItemKind;
  }
  return 0 as CompletionItemKind;
};

const fillCompletionSet = (
  set: Set<string>,
  token: Token,
  startChars: string,
): void => {
  let keyMatch: RegExpMatchArray | null;
  // TODO: complete with current date YYYY-MM-DD if starts with its parts
  if (token.content.startsWith(startChars)) {
    if ((keyMatch = token.content.match(KEY_WITH_COLON_RE))) {
      set.add(keyMatch[0]);
    } else {
      set.add(token.content);
    }
  }
};

export const registerCompletionHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onCompletion(
    (params: CompletionParams): CompletionItem[] | null => {
      const doc = documents.get(params.textDocument.uri);
      if (!doc) return null;

      const docTokens = retrieveDocTokens(doc) as Token[];
      const currentToken: Token =
        docTokens[getIndexAtPosition(docTokens, params.position)[0]];

      const completionSet: Set<string> = new Set<string>();
      let triggerChars: string;

      if (params.context?.triggerKind === 2) {
        if (!positionIsInsideToken(params.position, currentToken)) {
          triggerChars = params.context.triggerCharacter as string;
        } else {
          triggerChars = currentToken.content;
          fillCompletionSet(completionSet, currentToken, triggerChars);
        }
      } else if (params.context?.triggerKind === 1) {
        triggerChars = currentToken.content;
        fillCompletionSet(completionSet, currentToken, triggerChars);
      }
      // TODO: triggerKind === 3

      docTokens.forEach((token: Token) => {
        fillCompletionSet(completionSet, token, triggerChars);
      });

      return Array.from(completionSet).map(
        (word: string): CompletionItem => ({
          label: word,
          // TODO: labelKind
          kind: getCompletionKind(word),
          textEdit: {
            range: {
              start: {
                line: params.position.line,
                character: params.position.character - 1,
              },
              end: {
                line: params.position.line,
                character: params.position.character,
              },
            },
            newText: word,
          },
        }),
      ) as CompletionItem[];
    },
  );
};
