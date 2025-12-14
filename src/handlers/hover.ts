import {
  Connection,
  Hover,
  TextDocuments,
  TextDocumentPositionParams,
  Range,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { Token, TodotxtTokenType } from "../parser/tokenTypes";
import { decodeTokenType, encodeTokenType } from "../parser/utils";
import { retrieveDocTokens, getIndexAtPosition, getTokenEnd } from "../tokenctl/utils";

const TODOTXT_DOC_URL =
  "https://github.com/todotxt/todo.txt?tab=readme-ov-file";
const TOKEN_TYPE_DOC_URL_MAP: string[] = [
  `${TODOTXT_DOC_URL}#todotxt-format-rules`,
  `${TODOTXT_DOC_URL}#rule-1-if-priority-exists-it-always-appears-first`,
  `${TODOTXT_DOC_URL}#rule-2-a-tasks-creation-date-may-optionally-appear-directly-after-priority-and-a-space`,
  `${TODOTXT_DOC_URL}#rule-2-the-date-of-completion-appears-directly-after-the-x-separated-by-a-space`,
  `${TODOTXT_DOC_URL}#complete-tasks-2-format-rules`,
  `${TODOTXT_DOC_URL}#project`,
  `${TODOTXT_DOC_URL}#context`,
  `${TODOTXT_DOC_URL}#additional-file-format-definitions`,
];

// TODO: more consistent function prototype
const createHoverContent = (
   tokenType: number, tokenTypeName: TodotxtTokenType, content: string
): string => {
  // TODO: priorities, creation and completion dates and completion marks are not highlighted (by tree-sitter) because "(tokenType) " is prepending. Think about a solution.
  return `\`\`\`todo.txt
(${tokenTypeName}) ${content}
\`\`\`
___
[Format spec](${TOKEN_TYPE_DOC_URL_MAP[tokenType]})`;
};

const BEGINNING_TOKEN_PATTERNS: number[] = [
  "priority",
  "completionMark",
  "creationDate",
  "completionDate"
].map((tokenType: string) => encodeTokenType(tokenType));

const getCoverageInterval = (tokens: Token[], index: number): [number, number] => {
  let start: number = index; let end: number = index;

  if (decodeTokenType(tokens[index].tokenType) === "description") {
    for (;
      start > 0
      && tokens[start - 1]?.line === tokens[index].line
      && BEGINNING_TOKEN_PATTERNS.indexOf(tokens[start - 1].tokenType) === -1;
      start--
    ) {} // eslint-disable-line no-empty

    for (;
      end < tokens.length - 1
      && tokens[end + 1]?.line === tokens[index].line;
      end++
    ) {} // eslint-disable-line no-empty
  }

  return [start, end];
}

const getTokenIntervalText = (
	tokens: Token[],
 	intervalStart: number,
  intervalEnd: number
): string => {
  let resultText: string = tokens[intervalStart].content;
  for (let i: number = intervalStart + 1; i <= intervalEnd; i++) {
 	/* NOTE: tokenizing text doesn't count which exact whitespaces split tokens.
  	Task description inside hover response may be incorrect if \t are used inside task text. */
    resultText += " ".repeat(
    	tokens[i].character - getTokenEnd(tokens[i-1])
    ) + tokens[i].content;
  }
	return resultText;
};

const getTokenRange = (
  tokens: Token[],
  tokenIntervalStart: number,
  tokenIntervalEnd: number,
): Range => {
  return {
    start: {
    	line: tokens[tokenIntervalStart].line,
     	character: tokens[tokenIntervalStart].character
    },
    end: {
    	line: tokens[tokenIntervalEnd].line,
    	character: tokens[tokenIntervalEnd].character + tokens[tokenIntervalEnd].content.length
    },
  };
};

export const registerHoverHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onHover((params: TextDocumentPositionParams): Hover | null => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return null;

		const docTokens = retrieveDocTokens(doc);
		if (!docTokens) return null;

    const tokenIndex: number = getIndexAtPosition(
      docTokens, params.position, false
		)[0];
    const currentToken: Token = docTokens[tokenIndex];
    if (!currentToken) return null;

    const tokenTypeName: TodotxtTokenType = decodeTokenType(currentToken.tokenType);
		const [tokenIntervalStart, tokenIntervalEnd]: [number, number] = getCoverageInterval(
			docTokens, tokenIndex
		);

    return {
      contents: {
        kind: "markdown",
        value: createHoverContent(
          // 0,
          currentToken.tokenType,
          // "aboba",
           tokenTypeName,
           // `${tokenIntervalStart} ${tokenIntervalEnd}`
           // `${tokenIndex}`
          tokenTypeName === "description"
          ? getTokenIntervalText(docTokens, tokenIntervalStart, tokenIntervalEnd)
          : currentToken.content
        )
      },
      range: getTokenRange(
        docTokens, tokenIntervalStart, tokenIntervalEnd
      )
    };
  });
};
