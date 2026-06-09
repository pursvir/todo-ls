import { Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";

// TODO: customize Diagnostic severities via config options.

/** Create `Diagnostic` for range which claims that the creation date is newer than today, which is normally impossible. */
export const diagnoseCreationDateError = (range: Range): Diagnostic => {
  return Diagnostic.create(
    range,
    "Invalid creation date: later than today",
    DiagnosticSeverity.Error,
  );
};

export const diagnoseCompletionDateError = (range: Range): Diagnostic => {
  return Diagnostic.create(
    range,
    "Invalid completion date: later than today",
    DiagnosticSeverity.Error,
  );
};

export const diagnoseMissingCompletionDateError = (
  range: Range,
): Diagnostic => {
  return Diagnostic.create(
    range,
    "Missing completion date for completed task!",
    DiagnosticSeverity.Error,
  );
};
