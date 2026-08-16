import {
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  Connection,
  CodeActionKind,
} from "vscode-languageserver/node";

import { NAME, VERSION } from "../info";

export let initOptionsConfig: any;

export const registerInitializeHandler = (connection: Connection): void => {
  connection.onInitialize((params: InitializeParams): InitializeResult => {
    const initResult: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        hoverProvider: true,
        completionProvider: {
          triggerCharacters: ["(", "@", "+"],
        },
        codeActionProvider: {
          resolveProvider: false,
          codeActionKinds: [CodeActionKind.QuickFix],
        }
      },
      serverInfo: {
        name: NAME,
        version: VERSION,
      },
    };

    // if (capabilities.workspace && capabilities.workspace.workspaceFolders)
    //   initResult.capabilities.workspace = {
    //     workspaceFolders: {
    //       supported: true,
    //     },
    //   };

    initOptionsConfig = params.initializationOptions;

    return initResult;
  });
};
