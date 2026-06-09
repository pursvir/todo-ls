import {
  Connection,
  Hover,
  TextDocuments,
  TextDocumentPositionParams,
  Range,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { Token } from "../parser/tokenTypes";
import { encodeTokenType } from "../parser/tokenEncoder";
import {
  getDocTokens,
  getIndexAtPosition,
  getTokenEnd,
} from "../utils/tokenUtils";
import { TokenPointer } from "../utils/tokenUtils";
import { tokenTypeReprs } from "../parser/tokenTypeReprs";

const docUrlRoot = "https://github.com/todotxt/todo.txt?tab=readme-ov-file";

// String indexes correspond to tokenType numbers.
const tokenTypeUrls: string[] = [
  `${docUrlRoot}#todotxt-format-rules`,
  `${docUrlRoot}#rule-1-if-priority-exists-it-always-appears-first`,
  `${docUrlRoot}#rule-2-a-tasks-creation-date-may-optionally-appear-directly-after-priority-and-a-space`,
  `${docUrlRoot}#rule-2-the-date-of-completion-appears-directly-after-the-x-separated-by-a-space`,
  `${docUrlRoot}#complete-tasks-2-format-rules`,
  `${docUrlRoot}#project`,
  `${docUrlRoot}#context`,
  `${docUrlRoot}#additional-file-format-definitions`,
];

/**
 * Returns Markdown text for hover event, including token's type, content and format specification.
 * @param tokenType - token's type.
 * @param content - hovered content.
 * @returns - Markdown text.
 */
const createHoverContent = (tokenType: number, content: string): string => {
  const prefix = tokenTypeReprs[tokenType];
  return `\`\`\`todo.txt
${prefix}: ${content}
\`\`\`
___
[format specs](${tokenTypeUrls[tokenType]})`;
};

const taskBeginningPatterns: number[] = [
  "priority",
  "completionMark",
  "creationDate",
  "completionDate",
].map((tokenType: string) => encodeTokenType(tokenType));

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
const getCoverageInterval = (tokens: Token[], index: number): IndexInterval => {
  let start: number = index;
  let end: number = index;

  if (tokens[index].tokenType === 0) {
    for (
      ;
      start > 0 &&
      tokens[start - 1]?.line === tokens[index].line &&
      taskBeginningPatterns.indexOf(tokens[start - 1].tokenType) === -1;
      start--
    ) {} // eslint-disable-line no-empty

    for (
      ;
      end < tokens.length - 1 && tokens[end + 1]?.line === tokens[index].line;
      end++
    ) {} // eslint-disable-line no-empty
  }

  return {
    start: start,
    end: end,
  } as IndexInterval;
};

/**
 * Returns text inside start-end interval of `Token[]` array.
 */
const getTextInsideInterval = (
  tokens: Token[],
  interval: IndexInterval,
): string => {
  let resultText: string = tokens[interval.start].content;
  for (let i: number = interval.start + 1; i <= interval.end; i++) {
    /* NOTE: text tokenizer doesn't count which exact whitespaces split tokens.
  	 Task description inside hover response may be incorrect if \t are used inside task text. */
    resultText +=
      " ".repeat(tokens[i].character - getTokenEnd(tokens[i - 1])) +
      tokens[i].content;
  }
  return resultText;
};

const getTokenRange = (tokens: Token[], interval: IndexInterval): Range => {
  return {
    start: {
      line: tokens[interval.start].line,
      character: tokens[interval.start].character,
    },
    end: {
      line: tokens[interval.end].line,
      character:
        tokens[interval.end].character + tokens[interval.end].content.length,
    },
  } as Range;
};

export const registerHoverHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onHover((params: TextDocumentPositionParams): Hover | null => {
    connection.console.debug(
      `New hover event on line ${params.position.line} character ${params.position.character}`,
    );
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return null;

    const tokens = getDocTokens(doc);
    if (!tokens) return null;

    const tokenPtr: TokenPointer = getIndexAtPosition(
      tokens,
      params.position,
      false,
    );

    const currentToken: Token = tokens[tokenPtr.index];
    if (!currentToken) return null;

    const contextInterval: IndexInterval = getCoverageInterval(
      tokens,
      tokenPtr.index,
    );

    const content: string = createHoverContent(
      currentToken.tokenType,
      currentToken.tokenType === 0
        ? getTextInsideInterval(tokens, contextInterval)
        : currentToken.content,
    );
    const range: Range = getTokenRange(tokens, contextInterval);

    return {
      contents: {
        kind: "markdown",
        value: content,
      },
      range: range,
    } as Hover;
  });
};
