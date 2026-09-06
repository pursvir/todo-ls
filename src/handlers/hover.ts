import {
  Connection,
  Hover,
  TextDocuments,
  TextDocumentPositionParams,
  Range,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { TodotxtTokenType, Token } from "../parser/tokenTypes";
import {
  getPositionIndex,
  getTokenEnd,
  rangeBetweenTokens,
} from "../utils/tokenUtils";
import { TokenPointer } from "../utils/tokenUtils";
import { TodotxtTokenTypes } from "../parser/tokenTypes";
import { storage } from "../server";


const DOC_URL_ROOT: string = "https://github.com/todotxt/todo.txt?tab=readme-ov-file";

// String indexes correspond to tokenType numbers.
const tokenTypeUrls: string[] = [
  `${DOC_URL_ROOT}#todotxt-format-rules`,
  `${DOC_URL_ROOT}#rule-1-if-priority-exists-it-always-appears-first`,
  `${DOC_URL_ROOT}#rule-2-a-tasks-creation-date-may-optionally-appear-directly-after-priority-and-a-space`,
  `${DOC_URL_ROOT}#rule-2-the-date-of-completion-appears-directly-after-the-x-separated-by-a-space`,
  `${DOC_URL_ROOT}#complete-tasks-2-format-rules`,
  `${DOC_URL_ROOT}#project`,
  `${DOC_URL_ROOT}#context`,
  `${DOC_URL_ROOT}#additional-file-format-definitions`,
];

/**
 * Returns Markdown text for hover event, including token's type, content and format specification.
 * @param tokenType - token's type.
 * @param content - hovered content.
 * @returns - Markdown text.
 */
function createHoverContent(tokenType: number, content: string): string {
    const prefix = TodotxtTokenTypes[tokenType];
    return `\`\`\`todo.txt
${prefix}: ${content}
\`\`\`
___
[format specs](${tokenTypeUrls[tokenType]})`;
}

const taskBeginningPatterns: Set<number> = new Set<number>([
  TodotxtTokenType.Priority,
  TodotxtTokenType.CreationDate,
  TodotxtTokenType.CompletionDate,
  TodotxtTokenType.CompletionMark,
]);

/**
 * A special type for `Token[]` interval (start-end indexes).
 */
interface IndexInterval {
  start: number;
  end: number;
}

/**
 * Returns `IndexInterval`, indicating start and end of hover context inside `Token[]` array.
 * If common text is hovered, then index interval is returned for the whole task description.
 */
const getCoverageInterval = (lineTokens: Token[], index: number): IndexInterval => {
  if (lineTokens[index].tokenType === 0) {
    for (
      ;
      index > 0 && (!taskBeginningPatterns.has(lineTokens[index - 1].tokenType));
      index--
    ) { }

    return {
      start: index,
      end: lineTokens.length - 1,
    }
  } else {
    return {
      start: index,
      end: index,
    }
  }
};

/**
 * Returns text inside start-end interval of `Token[]` array.
 */
function getTextInsideInterval(tokens: Token[],
    interval: IndexInterval): string {
    let resultText: string = tokens[interval.start].content;
    for (let i: number = interval.start + 1; i <= interval.end; i++) {
        /* NOTE: text tokenizer doesn't count which exact whitespaces split tokens.
         Task description inside hover response may be incorrect if \t are used inside task text. */
        resultText +=
            " ".repeat(tokens[i].character - getTokenEnd(tokens[i - 1])) +
            tokens[i].content;
    }
    return resultText;
}

export function registerHoverHandler(connection: Connection,
    documents: TextDocuments<TextDocument>): void {
    connection.onHover((params: TextDocumentPositionParams): Hover | null => {
        connection.console.debug(
            `New hover event on line ${params.position.line} character ${params.position.character}`
        );
        const doc = documents.get(params.textDocument.uri);
        if (!doc) return null;

        const tokens = storage.get(doc);
        if (!tokens) {
            connection.console.debug(`No tokens for ${doc.uri}!`);
            return null;
        }

        const tokenPtr: TokenPointer = getPositionIndex(
            tokens[params.position.line], params.position, false
        );

        const currentToken: Token = tokens[params.position.line][tokenPtr.index];
        if (!currentToken) return null;

        const contextInterval: IndexInterval = getCoverageInterval(
            tokens[params.position.line],
            tokenPtr.index
        );

        // TODO: create a key-value (Map<number, string>) cache for hover contents
        const content: string = createHoverContent(
            currentToken.tokenType,
            currentToken.tokenType === 0
                ? getTextInsideInterval(tokens[params.position.line], contextInterval)
                : currentToken.content
        );
        const range: Range = rangeBetweenTokens(
            tokens[params.position.line][contextInterval.start],
            tokens[params.position.line][contextInterval.end]
        );

        return {
            contents: {
                kind: "markdown",
                value: content,
            },
            range: range,
        } as Hover;
    });
}
