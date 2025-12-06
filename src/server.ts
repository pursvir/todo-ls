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
	registerFileChangeHandler,
	registerFileCloseHandler,
	registerFileOpenHandler,
} from "./handlers/change";

export const connection: Connection = createConnection(ProposedFeatures.all);
export const documents: TextDocuments<TextDocument> = new TextDocuments(
	TextDocument,
);

registerInitializeHandler(connection);
registerHoverHandler(connection, documents);
registerCompletionHandler(connection, documents);
registerFileOpenHandler(connection);
registerFileCloseHandler(connection);
registerFileChangeHandler(connection, documents);

connection.console.log("Starting todo-ls");
