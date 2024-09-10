#!/usr/bin/env node

import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createAndUploadReport } from "./index.js";
import { red, type Options } from "@codecov/bundler-plugin-core";
import { type BundleAnalyzerOptions } from "./options";

interface Argv {
  buildDirectoryPath: string;
  dryRun: boolean;
  uploadToken?: string;
  apiUrl: string;
  bundleName?: string;
  debug: boolean;
  ignorePatterns?: string[];
  normalizeAssetsPattern?: string;
  additionalBuildDirectories?: string[];
}

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 <build-directory-path> [options]")
  .command(
    "$0 <build-directory-path>",
    "Analyze and upload bundle report",
    (yargs) => {
      return yargs.positional("buildDirectoryPath", {
        describe: "The path to the build directory",
        type: "string",
        demandOption: true,
      });
    },
  )
  .options({
    "dry-run": {
      alias: "d",
      type: "boolean",
      description: "Perform a dry run without uploading",
      default: false,
    },
    "upload-token": {
      alias: "t",
      type: "string",
      description: "Specify the upload token for authentication",
    },
    "api-url": {
      alias: "u",
      type: "string",
      description: "Set the API URL",
      default: "https://api.codecov.io",
    },
    "bundle-name": {
      alias: "n",
      type: "string",
      description: "Set the bundle identifier in Codecov",
      demandOption: true,
    },
    debug: {
      alias: "v",
      type: "boolean",
      description: "Enable debug mode for additional logging",
      default: false,
    },
    "ignore-patterns": {
      alias: "i",
      type: "array",
      description: "Specify file patterns to ignore during the analysis",
    },
    "normalize-assets-pattern": {
      alias: "p",
      type: "string",
      description: "Pattern to normalize asset names, e.g., '[name]-[hash].js'",
    },
    "additional-build-directories": {
      alias: "a",
      type: "array",
      description: "Additional directories to include in the report",
    },
  })
  .strict()
  .help("h")
  .alias("h", "help")
  .parseSync() as unknown as Argv;

function prepareCoreOptions(): Options {
  return {
    apiUrl: argv.apiUrl,
    dryRun: argv.dryRun,
    // Note that upload token may be empty in the case of "tokenless" or GitHub OIDC
    uploadToken: argv.uploadToken ?? process.env.CODECOV_UPLOAD_TOKEN,
    bundleName: argv.bundleName ?? "",
    debug: argv.debug,
  };
}

function prepareBundleAnalyzerOptions(): BundleAnalyzerOptions {
  return {
    ignorePatterns: argv.ignorePatterns,
    normalizeAssetsPattern: argv.normalizeAssetsPattern,
    additionalBuildDirectories: argv.additionalBuildDirectories,
  };
}

async function runCli(): Promise<void> {
  const resolvedDirectoryPath = path.resolve(
    process.cwd(),
    argv.buildDirectoryPath,
  );

  const coreOptions = prepareCoreOptions();
  const bundleAnalyzerOptions = prepareBundleAnalyzerOptions();

  const reportAsJson = await createAndUploadReport(
    resolvedDirectoryPath,
    coreOptions,
    bundleAnalyzerOptions,
  );

  if (coreOptions.dryRun) {
    // eslint-disable-next-line no-console
    console.log(reportAsJson);
  }
}

runCli().catch((error) => {
  red(`An error occurred: ${error}`);
  process.exit(1);
});
