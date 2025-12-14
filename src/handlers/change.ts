import {
  Connection,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams,
  DidCloseTextDocumentParams,
  TextDocumentContentChangeEvent,
  TextDocuments
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
  TextDocumentContentChangeEvent as _TextDocumentContentChangeEvent
} from "../_overrides/overrideChangeEvent";
import { deltaChangeTokens } from "../tokenctl/delta";
import { getTokenizedText } from "../parser/tokenizer";
import { Token } from "../parser/tokenTypes";
import { tokenCache, retrieveDocTokens } from "../tokenctl/utils";


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

      let docTokens = retrieveDocTokens(doc) as Token[];
      let spliceStartShift: number = 0;

      params.contentChanges.forEach(
        (change: TextDocumentContentChangeEvent) => {
          [docTokens, spliceStartShift] = deltaChangeTokens(
            docTokens,
            change as _TextDocumentContentChangeEvent,
            spliceStartShift);
        }
      );

      tokenCache.set(params.textDocument.uri, docTokens);
    },
  );
};
