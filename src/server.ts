import {
  createConnection,
  Connection,
  ProposedFeatures,
  TextDocuments,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { registerInitializeHandler } from "./handlers/initialize";
import {
  registerDocumentOpenHandler,
  registerDocumentCloseHandler,
  registerDocumentChangeHandler,
} from "./handlers/files";
import { registerHoverHandler } from "./handlers/hover";
import { registerCompletionHandler } from "./handlers/completion";
import { registerCodeActionHandler } from "./handlers/actions";

export const connection: Connection = createConnection(ProposedFeatures.all);
export const documents: TextDocuments<TextDocument> = new TextDocuments(
  TextDocument,
);

import { fileConfig, defaultConfig, TodolsConfig } from "./config";
import { initOptionsConfig } from "./handlers/initialize";
import { TokenStorage } from "./storage";

registerInitializeHandler(connection);

export let config: TodolsConfig;
if (fileConfig) {
  config = { ...defaultConfig, ...fileConfig };
} else {
  config = { ...defaultConfig, ...initOptionsConfig };
}

export const storage: TokenStorage = new TokenStorage();

registerDocumentOpenHandler(connection, documents, config);
registerDocumentCloseHandler(documents);
registerDocumentChangeHandler(connection, documents, config);

if (config.features.highlightingEnabled) {
  registerHoverHandler(connection, documents);
}
if (config.features.completionsEnabled) {
  registerCompletionHandler(connection, documents);
}
if (config.features.codeActionsEnabled) {
  registerCodeActionHandler(connection, documents);
}
