import fs from "fs";

import { DiagnosticSeverity } from "vscode-languageserver";


export interface DiagnosticsConfig {
  enabled: boolean,
  severity: DiagnosticSeverity,
}

// TODO: map those human-readable strings into DiagnosticSeverity numbers when loading user's config.
const severityMapper: Map<string, DiagnosticSeverity> = new Map<string, DiagnosticSeverity>([
  ["error", DiagnosticSeverity.Error],
  ["warning", DiagnosticSeverity.Warning],
  ["info", DiagnosticSeverity.Information],
  ["hint", DiagnosticSeverity.Hint],
]);

// TODO: make `npm run build:default-config` for generating `.todols.conf.template`.

/** todo-ls config structure. */
export type TodolsConfig = {
  features: {
    hoverEnabled: boolean,
    completionsEnabled: boolean,
    diagnosticsEnabled: boolean,
    /** Whether codeActions provider is enabled or not. */
    codeActionsEnabled: boolean,
  },
  diagnostics: {
    /** Duplicate projects, contexts and key-value tags' keys. */
    duplicateTags: DiagnosticsConfig,
    duplicateProjects?: DiagnosticsConfig | undefined,
    duplicateContexts?: DiagnosticsConfig | undefined,
    duplicateKeys?: DiagnosticsConfig | undefined,
    invalidDate: DiagnosticsConfig,
    /** Triggered by tasks which creation date is further than the day in which todo-ls is running. */
    futureCreationDates: DiagnosticsConfig,
    /** Triggered by tasks which completion date is further than the day in which todo-ls is running. */
    futureCompletionDates: DiagnosticsConfig,
    /** Triggered by tasks which don't have a completion date (which is prohibited by todo.txt specification). */
    noCompletionDates: DiagnosticsConfig,
    /** Triggered by tasks which don't have a creation date. */
    noCreationDates: DiagnosticsConfig,
    /** Triggered by completed tasks which completion date is older than creation one. */
    invalidCompletionChronology: DiagnosticsConfig,
    /** Triggered by tasks which don't have any "description" words and consist only of tags, priorities and so on. */
    noDescription: DiagnosticsConfig,
    /** Triggered by tasks where there are two or more whitespaces between its individual words. */
    redundantWhitespaces: DiagnosticsConfig,
    /** Triggered by empty lines in your todo.txt file (\n\n). */
    emptyLines: DiagnosticsConfig,
  }
}

/** The default todo-ls config, being applied if no config file is found or if it's invalid. */
export const defaultConfig: TodolsConfig = {
  features: {
    hoverEnabled: true,
    completionsEnabled: true,
    diagnosticsEnabled: true,
    codeActionsEnabled: true,
  },
  diagnostics: {
    duplicateTags: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    invalidDate: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    futureCreationDates: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    futureCompletionDates: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    noCompletionDates: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    noCreationDates: {
      enabled: false,
      severity: DiagnosticSeverity.Error,
    },
    invalidCompletionChronology: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    noDescription: {
      enabled: true,
      severity: DiagnosticSeverity.Warning,
    },
    redundantWhitespaces: {
      enabled: true,
      severity: DiagnosticSeverity.Warning,
    },
    emptyLines: {
      enabled: true,
      severity: DiagnosticSeverity.Hint,
    }
  }
};

const configPath: string = ".todols.conf";

/**
 * Todo LS configuration object.
 */
export let fileConfig: TodolsConfig | undefined;

try {
  /** todo-ls config read from project root. */
  fileConfig = {
    ...defaultConfig,
    // TODO: make config file a JSONC, to allow comments. Just for better UX.
    //  we could allow comments inside config files if we write some regex substitutions before parsing JSON.
    // TODO: on Windows, this might not be UTF-8 encoded text...
    ...JSON.parse(fs.readFileSync(configPath, "utf-8")),
  };
} catch (error) { }
