import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Connection,
  TextDocumentIdentifier,
  TextDocuments,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { getLines } from "../parser/utils";


function createSortAction(tasks: string[],
    docObj: TextDocument,
    docId: TextDocumentIdentifier,
    startLine: number,
    endChar: number): CodeAction {
    const sortedText: string = tasks
        .sort()
        .join("\n")
        .trimEnd();

    return {
        title: "Sort selected ITEMs",
        kind: CodeActionKind.QuickFix,
        isPreferred: false,
        edit: {
            documentChanges: [{
                textDocument: { uri: docId.uri, version: docObj.version },
                edits: [{
                    range: {
                        start: { line: startLine, character: 0 },
                        end: {
                            line: startLine + tasks.length - 1,
                            character: tasks[tasks.length === 0 ? 0 : tasks.length - 1].length
                        },
                    },
                    newText: sortedText,
                }]
            }],
        }
    };
}

export function registerCodeActionHandler(connection: Connection,
    documents: TextDocuments<TextDocument>): void {
    connection.onCodeAction((params: CodeActionParams): CodeAction[] => {
        const doc = documents.get(params.textDocument.uri);
        if (!doc) return [];

        const capturedText: string = doc.getText({
            start: { line: params.range.start.line, character: 0 },
            end: { line: params.range.end.line, character: Number.MAX_SAFE_INTEGER },
        });
        const capturedTasks: string[] = getLines(capturedText);

        const sortAction: CodeAction = createSortAction(
            capturedTasks,
            doc,
            params.textDocument,
            params.range.start.line,
            capturedTasks[capturedTasks.length === 0 ? 0 : capturedTasks.length - 1].length
        );

        // const markAsDoneAction: CodeAction = createMark
        // /^x .*$/
        // const toggleDoneAction: CodeAction = {
        //   title: "Mark selected ITEMs as done",
        //   kind: CodeActionKind.QuickFix,
        //   isPreferred: false,
        //   edit: {
        //     documentChanges: [{
        //       textDocument: { uri: params.textDocument.uri, version: doc.version },
        //       edits: [{
        //         range: {
        //           start: { line: params.range.start.line, character: 0 },
        //           end: {
        //             line: params.range.end.line,
        //             character: unsortedTasks[unsortedTasks.length === 0 ? 0 : unsortedTasks.length - 1].length
        //           },
        //         },
        //         newText: sortedText,
        //       }]
        //     }]
        //   }
        // }
        return [sortAction];
    });
}
