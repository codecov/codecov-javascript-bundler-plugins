#!/usr/bin/env node

import path from "node:path";
import { CreateAndHandleReport } from "./index.js";
import { parseArgs } from "node:util";
import { red } from "@codecov/bundler-plugin-core";

/** Parses command-line arguments and options. */
const { values: args, positionals: positionalArgs } = parseArgs({
  options: {
    "dry-run": {
      type: "boolean",
      short: "d",
    },
    "upload-token": {
      type: "string",
      short: "t",
    },
    "api-url": {
      type: "string",
      short: "a",
    },
    "bundle-name": {
      type: "string",
      short: "n",
    },
    debug: {
      type: "boolean",
      short: "v",
    },
  },
  allowPositionals: true,
});

/** Positional argument for the build directory path. */
const [buildDirectoryPath] = positionalArgs;

const {
  "dry-run": dryRun = false,
  "upload-token": uploadToken,
  "api-url": apiUrl = "https://api.codecov.io",
  "bundle-name": bundleName,
  debug = false,
} = args;

/** Checks if the build directory path is provided. */
if (!buildDirectoryPath) {
  red("Error: The build directory path is required.");
  process.exit(1);
}

/** Retrieves the upload token from CLI argument or environment variable. */
const token = uploadToken ?? process.env.CODECOV_UPLOAD_TOKEN;

/** Checks if the upload token is provided. */
if (!token) {
  red(
    "Error: An upload token is required. Provide it using --upload-token or set the CODECOV_UPLOAD_TOKEN environment variable.",
  );
  process.exit(1);
}

/**
 * Core options configuration for the report.
 *
 * @typedef {Object} CoreOptions
 * @property {string} [apiUrl] - The API URL for Codecov.
 * @property {boolean} [dryRun] - Whether to perform a dry run without uploading.
 * @property {string} uploadToken - The token used for authentication.
 * @property {string} bundleName - Bundle identifier in Codecov.
 * @property {boolean} [debug] - Enable debug mode for additional logging.
 */
const coreOptions = {
  apiUrl,
  dryRun,
  uploadToken: token,
  bundleName,
  debug,
};

/** Resolves the build directory path to an absolute path. */
const resolvedDirectoryPath = path.resolve(process.cwd(), buildDirectoryPath);

/** Main function to create and handle the report. Executes asynchronously and logs any errors. */
void (async () => {
  try {
    await CreateAndHandleReport(resolvedDirectoryPath, coreOptions);
  } catch (error) {
    red(`An error occurred: ${error}`);
    process.exit(1);
  }
})();
