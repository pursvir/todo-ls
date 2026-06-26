import fs from "fs";
import { connection } from "./server";

import { DiagnosticSeverity } from "vscode-languageserver";

interface DiagnosticsConfig {
  enabled: boolean,
  severity: DiagnosticSeverity,
}

/** todo-ls config fields. */
interface TodolsConfig {
  features: {
    highlightingEnabled: boolean,
    completionsEnabled: boolean,
    diagnosticsEnabled: boolean,
  },
  diagnostics: {
    futureCreationDatesBlaming: DiagnosticsConfig,
    futureCompletionDatesBlaming: DiagnosticsConfig,
    noCompletionDatesBlaming: DiagnosticsConfig,
    noCreationDatesBlaming: DiagnosticsConfig,
  }
}

/** The default todo-ls config, being applied if no config file is found or if it's invalid. */
const defaultConfig: TodolsConfig = {
  features: {
    highlightingEnabled: true,
    completionsEnabled: true,
    diagnosticsEnabled: true,
  },
  diagnostics: {
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
      enabled: true,
      severity: DiagnosticSeverity.Error,
    },
  }
};

// if no args were passed
const configPath: string = ".todols.conf";

/**
 * Todo LS configuration object.
 */
export let config: TodolsConfig;

try {
  // TODO: forbid arbitrary fields
  config = {
    ...defaultConfig,
    // TODO: we could allow comments inside config files if we write some regex substitutions before parsing JSON.
    ...JSON.parse(fs.readFileSync(configPath, "utf-8")),
  } as TodolsConfig;
  connection.console.debug(`Loaded config`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
  // TODO: check JSON parse errors and config file existence error separately
  connection.console.debug(`Failed to parse config, falling back to defaults`);
  config = defaultConfig as TodolsConfig;
}
