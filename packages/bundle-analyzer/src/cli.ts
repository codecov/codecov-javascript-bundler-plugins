#!/usr/bin/env node

import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createAndUploadReport } from "./index.js";
import { red, type Options } from "@codecov/bundler-plugin-core";

interface Argv {
  buildDirectoryPath: string;
  dryRun: boolean;
  uploadToken?: string;
  apiUrl: string;
  bundleName?: string;
  debug: boolean;
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
  })
  .strict()
  .help("h")
  .alias("h", "help")
  .parseSync() as unknown as Argv;

function prepareCoreOptions(): Options {
  const uploadToken = argv.uploadToken ?? process.env.CODECOV_UPLOAD_TOKEN;
  if (!uploadToken) {
    throw new Error(
      "An upload token is required. Use --upload-token or set the CODECOV_UPLOAD_TOKEN environment variable.",
    );
  }

  return {
    apiUrl: argv.apiUrl,
    dryRun: argv.dryRun,
    uploadToken,
    bundleName: argv.bundleName ?? "",
    debug: argv.debug,
  };
}

async function runCli(): Promise<void> {
  const resolvedDirectoryPath = path.resolve(
    process.cwd(),
    argv.buildDirectoryPath,
  );

  const coreOptions = prepareCoreOptions();

  const reportAsJson = await createAndUploadReport(
    resolvedDirectoryPath,
    coreOptions,
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
