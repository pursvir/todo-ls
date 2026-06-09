import { Connection, Diagnostic } from "vscode-languageserver";

import { Token } from "../parser/tokenTypes";
import { generateISODate } from "../utils/dateUtils";
import {
  diagnoseCreationDateError,
  diagnoseCompletionDateError,
  diagnoseMissingCompletionDateError,
} from "./diagnosis";
import { rangeBetweenTokens, rangeForToken } from "../utils/tokenUtils";

//** Analyze document to find errors. */
export const analyzeDocument = (
  tokens: Token[] | undefined,
  documentURI: string,
  connection: Connection,
): void => {
  // if document tokens are not loaded into cache yet
  if (!tokens) return;

  const diagnostics: Diagnostic[] = [];
  // TODO: if a document is open and not changed for many hours, this can become outdated.
  const today: string = generateISODate();

  let completionMarkToken: Token | null = null;
  let lastCompletionLineToken: Token | null = null;
  let compDateWasPresent: boolean = false;

  tokens.forEach((token: Token) => {
    if (completionMarkToken) {
      if (token.line !== completionMarkToken.line) {
        if (!compDateWasPresent) {
          // Original todo.txt standard requires you to set (completion) date after completion mark -
          //  https://github.com/todotxt/todo.txt#rule-2-the-date-of-completion-appears-directly-after-the-x-separated-by-a-space
          // and, by default, if it's not present, this language server sends diagnostics error for the line num corresponding with that task.
          diagnostics.push(
            diagnoseMissingCompletionDateError(
              // @ts-expect-error TS2345
              rangeBetweenTokens(completionMarkToken, lastCompletionLineToken),
            ),
          );
        }

        completionMarkToken = null;
        lastCompletionLineToken = null;
        compDateWasPresent = false;
      } else {
        lastCompletionLineToken = token;
      }
    }

    if (
      // completion mark
      token.tokenType === 4
    ) {
      completionMarkToken = token;
    } else if (token.tokenType === 2 && token.content > today) {
      diagnostics.push(diagnoseCreationDateError(rangeForToken(token)));
    } else if (token.tokenType === 3) {
      if (completionMarkToken) {
        compDateWasPresent = true;
      }
      if (token.content > today) {
        diagnostics.push(diagnoseCompletionDateError(rangeForToken(token)));
      }
    }
  });

  // TODO: DRY violation
  if (completionMarkToken && (!compDateWasPresent)) {
    diagnostics.push(
      diagnoseMissingCompletionDateError(
        // @ts-expect-error TS2345
        rangeBetweenTokens(completionMarkToken, lastCompletionLineToken),
      ),
    );
  }

  connection.console.debug(
    `Found ${diagnostics.length} error while scanning document`,
  );
  connection.sendDiagnostics({
    uri: documentURI,
    diagnostics: diagnostics,
  });
};
