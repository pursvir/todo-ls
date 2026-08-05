import {
  Connection,
  TextDocumentChangeEvent,
  TextDocuments,
} from "vscode-languageserver";

import { storage } from "../server";
import { TextDocument } from "vscode-languageserver-textdocument";
import { analyzeDocument } from "../diagnostics/analysis";
import { TodolsConfig } from "../config";


export const registerDocumentOpenHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  config: TodolsConfig,
): void => {
  documents.onDidOpen((change: TextDocumentChangeEvent<TextDocument>): void => {
    const doc: TextDocument | undefined = documents.get(change.document.uri);
    if (!doc) return;

    storage.set(doc);

    if (config.features.diagnosticsEnabled) {
      const diagnostics = analyzeDocument(change.document);

      connection.sendDiagnostics({
        uri: change.document.uri,
        diagnostics: diagnostics,
      });
    }
  });
};

export const registerDocumentChangeHandler = (
  connection: Connection,
  documents: TextDocuments<TextDocument>,
  config: TodolsConfig,
): void => {
  documents.onDidChangeContent(
    (change: TextDocumentChangeEvent<TextDocument>): void => {
      const doc: TextDocument | undefined = documents.get(change.document.uri);
      if (!doc) return;

      // TODO: delta update is intended to be here...
      storage.set(doc);

      if (config.features.diagnosticsEnabled) {
        const diagnostics = analyzeDocument(change.document);

        connection.sendDiagnostics({
          uri: change.document.uri,
          diagnostics: diagnostics,
        });
      }
    },
  );
};

export const registerDocumentCloseHandler = (
  documents: TextDocuments<TextDocument>,
): void => {
  documents.onDidClose(
    (change: TextDocumentChangeEvent<TextDocument>): void => {
      storage.delete(change.document);
    }
  );
};
