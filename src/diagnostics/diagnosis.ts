import { Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";
import { config } from "../config";

/** Create `Diagnostic` for range which claims that the creation date is newer than today, which is normally impossible. */
export const diagnoseCreationDateError = (range: Range): Diagnostic => {
  return Diagnostic.create(
    range,
    "Invalid creation date: later than today",
    config.diagnostics.futureCreationDatesBlaming.severity
  );
};

/** Create `Diagnostic` for range which claims that the completion date is newer than today, which is normally impossible. */
export const diagnoseCompletionDateError = (range: Range): Diagnostic => {
  return Diagnostic.create(
    range,
    "Invalid completion date: later than today",
    config.diagnostics.futureCompletionDatesBlaming.severity
  );
};

/** Create `Diagnostic` for range which claims that the completion date is missing, which is prohibited by the todo.txt standard
 * (it's customizable, though).
 */
export const diagnoseMissingCompletionDateError = (
  range: Range,
): Diagnostic => {
  return Diagnostic.create(
    range,
    "Missing completion date for completed task!",
    config.diagnostics.noCompletionDatesBlaming.severity
  );
};
