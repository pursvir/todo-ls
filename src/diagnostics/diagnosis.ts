import { Diagnostic } from "vscode-languageserver";

import { config } from "../server";
import { rangeBetweenTokens, tokenRange } from "../utils/tokenUtils";
import { Token } from "../parser/tokenTypes";
import { lineRange } from "../utils/tokenUtils";


export const diagnoseDuplicateProject = (token: Token): Diagnostic => {
  return Diagnostic.create(
    tokenRange(token),
    "Duplicate project",
    config.diagnostics.duplicateProjects !== undefined
      ? config.diagnostics.duplicateProjects.severity
      : config.diagnostics.duplicateTags.severity
  );
};

export const diagnoseDuplicateContext = (token: Token): Diagnostic => {
  return Diagnostic.create(
    tokenRange(token),
    "Duplicate context",
    config.diagnostics.duplicateContexts !== undefined
      ? config.diagnostics.duplicateContexts.severity
      : config.diagnostics.duplicateTags.severity
  );
};

export const diagnoseDuplicateKey = (token: Token): Diagnostic => {
  return Diagnostic.create(
    tokenRange(token),
    "Duplicate key-value tag",
    config.diagnostics.duplicateKeys !== undefined
      ? config.diagnostics.duplicateKeys.severity
      : config.diagnostics.duplicateTags.severity
  );
};

export const diagnoseInvalidDateToken = (token: Token): Diagnostic => {
  return Diagnostic.create(
    tokenRange(token),
    "Invalid date",
    config.diagnostics.invalidDate.severity,
  );
};

/** Create `Diagnostic` for range which claims that the creation date is newer than today, which is normally impossible. */
export const diagnoseInvalidCreationDateToken = (token: Token): Diagnostic => {
  return Diagnostic.create(
    tokenRange(token),
    "Invalid creation date: later than today",
    config.diagnostics.futureCreationDates.severity,
  );
};

/** Create `Diagnostic` for range which claims that the completion date is newer than today, which is normally impossible. */
export const diagnoseInvalidCompletionDateToken = (token: Token): Diagnostic => {
  return Diagnostic.create(
    tokenRange(token),
    "Invalid completion date: later than today",
    config.diagnostics.futureCompletionDates.severity,
  );
};

export const diagnoseInvalidCompletionChronology = (completionDate: Token, creationDate: Token): Diagnostic => {
  return Diagnostic.create(
    rangeBetweenTokens(completionDate, creationDate),
    "Invalid chronology: completion date is older than creation one",
    config.diagnostics.invalidCompletionChronology.severity,
  );
};

/** Create `Diagnostic` for range which claims that the completion date is missing, which is prohibited by the todo.txt standard
 * (it's customizable, though).
 */
export const diagnoseMissingCompletionDate = (
  line: number, tokens: Token[],
): Diagnostic => {
  return Diagnostic.create(
    lineRange(tokens, line),
    "Missing completion date!",
    config.diagnostics.noCompletionDates.severity,
  );
};

export const diagnoseMissingCreationDate = (
  line: number, tokens: Token[],
): Diagnostic => {
  return Diagnostic.create(
    lineRange(tokens, line),
    "Missing creation date!",
    config.diagnostics.noCreationDates.severity,
  );
};

export const diagnoseMissingDescription = (
  line: number, tokens: Token[],
): Diagnostic => {
  return Diagnostic.create(
    lineRange(tokens, line),
    "Missing task description!",
    config.diagnostics.noDescription.severity,
  );
};

export const diagnoseRedundantWhitespaces = (line: number, startChar: number, endChar: number): Diagnostic => {
  return Diagnostic.create({
    start: { line: line, character: startChar },
    end: { line: line, character: endChar },
  }, "Too many whitespaces",
  config.diagnostics.redundantWhitespaces.severity);
};
