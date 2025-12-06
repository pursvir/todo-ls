import {
  Connection,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
  TextDocumentContentChangeEvent,
  TextDocuments
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { tokenCache } from "../tokenManager";
import { getTokenizedText } from "../parser/tokenizer";
import { Token } from "../parser/tokenTypes";
import { retrieveDocTokens, getIndexAtPosition, positionIsInsideToken } from "../tokenManager";


export const registerFileOpenHandler = (connection: Connection) => {
  connection.onDidOpenTextDocument(
    (params: DidOpenTextDocumentParams): void => {
      tokenCache.set(
        params.textDocument.uri,
        getTokenizedText(params.textDocument.text),
      );
    },
  );
};

export const registerFileCloseHandler = (connection: Connection) => {
  connection.onDidCloseTextDocument(
    (params: DidCloseTextDocumentParams): void => {
      // TODO: sometimes it may be useful to leave it in the cache.
      tokenCache.delete(params.textDocument.uri);
    },
  );
};

export const registerFileChangeHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
) => {
  connection.onDidChangeTextDocument(
    (params: DidChangeTextDocumentParams): void => {
      const doc = documents.get(params.textDocument.uri);
      if (!doc) return;

      const docTokens = retrieveDocTokens(doc) as Token[];

      let spliceStartShift: number = 0;

      // TODO: get rid of errors of non-existing .range property of TextDocumentContentChangeEvent objects
      params.contentChanges.forEach(
        (change: TextDocumentContentChangeEvent) => {
          const pastedTokens: Token[] = getTokenizedText(
            // @ts-ignore
            change.text, change.range.start.line, change.range.start.character,
          );

          const spliceStartIndex: number = getIndexAtPosition(
            // @ts-ignore
            docTokens, change.range.start, true
          );
          const spliceEndIndex: number = getIndexAtPosition(
            // @ts-ignore
            docTokens, change.range.end, true
          );

          let lineShift: number =
            // @ts-ignore
            change.range.end.line - change.range.start.line
            + ((): number => {
              // @ts-ignore
              let previousLine: number = change.range.start.line;
              let sum: number = 0;
              for (let i: number = 0; i < pastedTokens.length; i++) {
                if (pastedTokens[i].line !== previousLine)
                  sum++;
                previousLine = pastedTokens[i].line;
              }
              return sum;
            })();
          // @ts-ignore
          const charShift: number = change.range.end.character - change.range.start.character + change.text.length;

          // Changing first and last pasted text tokens content based on surrounding old tokens info.
          if (pastedTokens.length > 0) {
	          // @ts-ignore
	          if (positionIsInsideToken(docTokens[spliceStartIndex], change.range.start))
	            pastedTokens[0].content = docTokens[spliceStartIndex].content.slice(
	              0, // @ts-ignore
	              change.range.start.character - docTokens[overlapBeginIndex].char
	            ) + pastedTokens[0].content;
	          // @ts-ignore
	          if (positionIsInsideToken(docTokens[spliceEndIndex], change.range.end)) {
	            const ind: number = pastedTokens.length === 1 ? 0 : -1;
	            pastedTokens[ind].content =
	              pastedTokens[ind].content
	              + docTokens[spliceEndIndex].content.slice(
	                // @ts-ignore
	                change.range.end.character - pastedTokens[ind].char
	              );
	          }
          }

          docTokens.splice(
            spliceStartShift + spliceStartIndex,
            spliceStartShift + spliceEndIndex - spliceStartIndex,
            ...pastedTokens);
          spliceStartShift += spliceEndIndex - spliceStartIndex + pastedTokens.length;

          // Shifting .line and .char attributes of the rest of the tokens.
          for (
            let i: number = spliceStartIndex + pastedTokens.length;
            i < docTokens.length;
            i++
          ) {
            // @ts-ignore
            if (documentCache[i].line === change.range.end.line)
              docTokens[i].character += charShift;
            docTokens[i].line += lineShift;
          }
        },
      );

      tokenCache.set(params.textDocument.uri, docTokens);
    },
  );
};
