import fs from "fs";

import { DiagnosticSeverity } from "vscode-languageserver";

interface DiagnosticsConfig {
  enabled: boolean,
  severity: DiagnosticSeverity,
}

// TODO: map this from user's config
const severityMapper: Map<string, DiagnosticSeverity> = new Map<string, DiagnosticSeverity>([
  ["error", DiagnosticSeverity.Error],
  ["warning", DiagnosticSeverity.Warning],
  ["info", DiagnosticSeverity.Information],
  ["hint", DiagnosticSeverity.Hint],
]);

// TODO: make `npm run build:default-config` for generating `.todols.conf.template`.

/** todo-ls config fields. */
export type TodolsConfig = {
  features: {
    highlightingEnabled: boolean,
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
    /** Triggered by tasks which creation date is further than the day in which todo-ls is running. */
    futureCreationDatesBlaming: DiagnosticsConfig,
    /** Triggered by tasks which completion date is further than the day in which todo-ls is running. */
    futureCompletionDatesBlaming: DiagnosticsConfig,
    /** Triggered by tasks which don't have a completion date (which is prohibited by todo.txt specification). */
    noCompletionDatesBlaming: DiagnosticsConfig,
    /** Triggered by tasks which don't have a creation date. */
    noCreationDatesBlaming: DiagnosticsConfig,
    /** Triggered by completed tasks which completion date is older than creation one. */
    invalidCompletionChronology: DiagnosticsConfig,
    /** Triggered by tasks which don't have any "description" words and consist only of tags, priorities and so on. */
    noDescriptionBlaming: DiagnosticsConfig,
    /** Triggered by tasks where there are two or more whitespaces between its individual words. */
    redundantWhitespaces: DiagnosticsConfig,
  }
}

/** The default todo-ls config, being applied if no config file is found or if it's invalid. */
export const defaultConfig: TodolsConfig = {
  features: {
    highlightingEnabled: true,
    completionsEnabled: true,
    diagnosticsEnabled: true,
    codeActionsEnabled: true,
  },
  diagnostics: {
    duplicateTags: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    futureCreationDatesBlaming: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    futureCompletionDatesBlaming: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    noCompletionDatesBlaming: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    noCreationDatesBlaming: {
      enabled: false,
      severity: DiagnosticSeverity.Error,
    },
    invalidCompletionChronology: {
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
    noDescriptionBlaming: {
      enabled: true,
      severity: DiagnosticSeverity.Warning,
    },
    redundantWhitespaces: {
      enabled: true,
      severity: DiagnosticSeverity.Warning,
    },
  }
};

const configPath: string = ".todols.conf";

/**
 * Todo LS configuration object.
 */
export let fileConfig: TodolsConfig;

try {
  // TODO: forbid arbitrary fields
  // TODO: make config file a JSONC, to allow comments. Just for better UX.
  fileConfig = {
    ...defaultConfig,
    // TODO: we could allow comments inside config files if we write some regex substitutions before parsing JSON.
    // TODO: on Windows, this might not be UTF-8 encoded text...
    ...JSON.parse(fs.readFileSync(configPath, "utf-8")),
  } satisfies TodolsConfig;
  // connection.console.debug(`Loaded config from ${configPath}`);
} catch (error) {
  // TODO: check JSON parse errors and config file existence error separately
  // connection.console.debug(`Failed to parse config, falling back to defaults`);
}
