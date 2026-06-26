import {
  createConnection,
  Connection,
  ProposedFeatures,
  TextDocuments,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { registerHoverHandler } from "./handlers/hover";
import { registerInitializeHandler } from "./handlers/initialize";
import { registerCompletionHandler } from "./handlers/completion";
import {
  registerDocumentChangeHandler,
  registerDocumentOpenHandler,
  registerFileChangeHandler,
  registerFileCloseHandler,
  registerFileOpenHandler,
} from "./handlers/files";

export const connection: Connection = createConnection(ProposedFeatures.all);
export const documents: TextDocuments<TextDocument> = new TextDocuments(
  TextDocument,
);

import { config } from "./config";

registerInitializeHandler(connection);
if (config.features.highlightingEnabled) {
  registerHoverHandler(connection, documents);
}
if (config.features.completionsEnabled) {
  registerCompletionHandler(connection, documents);
}
registerFileOpenHandler(connection);
registerFileCloseHandler(connection);
registerFileChangeHandler(connection, documents);

if (config.features.diagnosticsEnabled) {
  registerDocumentOpenHandler(connection, documents);
  registerDocumentChangeHandler(connection, documents);
}
