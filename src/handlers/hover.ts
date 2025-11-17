import {
  Connection,
  Hover,
  Position,
  TextDocuments,
  TextDocumentPositionParams,
  Range,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { TodotxtTokenType } from "../parser/tokenTypes";
import {
  IndexedToken,
  tokenizeLine,
  getTokenAtPosition,
} from "../parser/tokenizer";
import {
  determineTodotxtTokenType,
  getDescriptionStart,
} from "../parser/lexer";
import { getRows } from "../parser/utils";

const TODOTXT_DOC_URL =
  "https://github.com/todotxt/todo.txt?tab=readme-ov-file";
const tokenTypeDocUrlMap: Record<TodotxtTokenType, string> = {
  completionMark: `${TODOTXT_DOC_URL}#complete-tasks-2-format-rules`,
  priority: `${TODOTXT_DOC_URL}#rule-1-if-priority-exists-it-always-appears-first`,
  creationDate: `${TODOTXT_DOC_URL}#rule-2-a-tasks-creation-date-may-optionally-appear-directly-after-priority-and-a-space`,
  completionDate: `${TODOTXT_DOC_URL}#rule-2-the-date-of-completion-appears-directly-after-the-x-separated-by-a-space`,
  project: `${TODOTXT_DOC_URL}#project`,
  context: `${TODOTXT_DOC_URL}#context`,
  keyValue: `${TODOTXT_DOC_URL}#additional-file-format-definitions`,
  description: `${TODOTXT_DOC_URL}#todotxt-format-rules`,
};

const createHoverContent = (
  token: string,
  tokenType: TodotxtTokenType,
): string => {
  return `\`\`\`todo.txt
(${tokenType}) ${token}
\`\`\`
___
[Format spec](${tokenTypeDocUrlMap[tokenType]})`;
};

const determineTokenRange = (
  token: IndexedToken,
  tokenType: TodotxtTokenType,
  rows: string[],
  position: Position,
): Range => {
  let start: number, end: number;
  if (tokenType !== "description") {
    start = token.start;
    end = token.start + token.token.length;
  } else {
    start = getDescriptionStart(rows[position.line]);
    end = rows[position.line].length;
  }
  return {
    start: { line: position.line, character: start } as Position,
    end: { line: position.line, character: end } as Position,
  };
};

export const registerHoverHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onHover((params: TextDocumentPositionParams): Hover | null => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return null;

    const rows: string[] = getRows(doc.getText());
    const row: string = rows[params.position.line];

    const tokens: IndexedToken[] = tokenizeLine(row);
    const token: IndexedToken = getTokenAtPosition(
      tokens,
      params.position.character,
    );
    if (!token) return null;

    let tokenType: TodotxtTokenType = determineTodotxtTokenType(token, tokens);
    const tokenRange: Range = determineTokenRange(
      token,
      tokenType,
      rows,
      params.position,
    );

    const content: string = createHoverContent(
      tokenType === "description"
        ? rows[params.position.line].slice(
            getDescriptionStart(rows[params.position.line]),
          )
        : token.token,
      tokenType,
    );

    return {
      contents: {
        kind: "markdown",
        value: content,
      },
      range: tokenRange,
    };
  });
};
