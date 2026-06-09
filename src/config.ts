import fs from "fs";
import { connection } from "./server";

interface TodolsConfig {
  enableHighlighting: boolean;
  enableCompletions: boolean;
  enableDiagnostics: boolean;
}

const defaultConfig: TodolsConfig = {
  enableHighlighting: true,
  enableCompletions: true,
  enableDiagnostics: true,
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
    ...JSON.parse(fs.readFileSync(configPath, "utf-8")),
  } as TodolsConfig;
  connection.console.debug(`Loaded config`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
  // TODO: check JSON parse errors and config file existence error separately
  connection.console.debug(`Failed to parse config, falling back to defaults`);
  config = defaultConfig as TodolsConfig;
}
