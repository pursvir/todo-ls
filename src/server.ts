import {
  createConnection,
  Connection,
  TextDocuments,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { registerHoverHandler } from "./handlers/hover";
import { registerInitializeHandler } from "./handlers/initialize";
import { registerCompletionHandler } from "./handlers/completion";

export const connection: Connection = createConnection();
export const documents: TextDocuments<TextDocument> = new TextDocuments(
  TextDocument,
);

registerInitializeHandler(connection);
registerHoverHandler(connection, documents);
registerCompletionHandler(connection, documents);
