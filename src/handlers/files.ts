import {
  Connection,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentParams,
  TextDocumentChangeEvent,
  TextDocuments,
} from "vscode-languageserver";

import { tokenCache } from "../utils/tokenUtils";
import { tokenizeText } from "../parser/tokenizer";
import { TextDocument } from "vscode-languageserver-textdocument";
import { analyzeDocument } from "../diagnostics/analysis";

export const registerFileOpenHandler = (connection: Connection): void => {
  connection.onDidOpenTextDocument((params: DidOpenTextDocumentParams) => {
    connection.console.debug(
      `Opening document ${params.textDocument.uri} event`,
    );
    tokenCache.set(
      params.textDocument.uri,
      tokenizeText(params.textDocument.text),
    );
  });
};

export const registerFileCloseHandler = (connection: Connection): void => {
  connection.onDidCloseTextDocument((params: DidCloseTextDocumentParams) => {
    connection.console.debug(
      `Closing document ${params.textDocument.uri} event`,
    );
    // TODO: do not delete this from cache if TODO_DIR discovery option is on
    //  (in the future, when todo-ls will be configurable).
    tokenCache.delete(params.textDocument.uri);
  });
};

export const registerFileChangeHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  connection.onDidChangeTextDocument((params: DidChangeTextDocumentParams) => {
    connection.console.debug(`Incoming document change event`);
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return;

    // TODO: implement token cache delta updates for saving CPU resources.
    tokenCache.set(params.textDocument.uri, tokenizeText(doc.getText()));
  });
};

export const registerDocumentOpenHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  documents.onDidOpen((change: TextDocumentChangeEvent<TextDocument>) => {
    analyzeDocument(
      tokenCache.get(change.document.uri),
      change.document.uri,
      connection,
    );
  });
};

// TODO: I don't get difference between connection.onDidChangeTextDocument and documents.onDidChangeContent...
export const registerDocumentChangeHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
): void => {
  documents.onDidChangeContent(
    (change: TextDocumentChangeEvent<TextDocument>) => {
      analyzeDocument(
        tokenCache.get(change.document.uri),
        change.document.uri,
        connection,
      );
    },
  );
};
