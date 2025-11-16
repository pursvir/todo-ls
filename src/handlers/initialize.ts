import {
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  Connection,
} from "vscode-languageserver/node";

import { TodotxtTokenTypes } from "../parser/tokenTypes";
import { NAME, VERSION } from "../version";

export const registerInitializeHandler = (connection: Connection) => {
  connection.onInitialize((params: InitializeParams): InitializeResult => {
    const capabilities = params.capabilities;

    const initResult: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        hoverProvider: true,
        semanticTokensProvider: {
          legend: {
            tokenTypes: [...TodotxtTokenTypes],
            tokenModifiers: [],
          },
          full: true,
        },
        completionProvider: {
          triggerCharacters: ["@", "+"],
        },
      },
      serverInfo: {
        name: NAME,
        version: VERSION,
      },
    };

    if (!!(capabilities.workspace && capabilities.workspace.workspaceFolders))
      initResult.capabilities.workspace = {
        workspaceFolders: {
          supported: true,
        },
      };

    return initResult;
  });
};
