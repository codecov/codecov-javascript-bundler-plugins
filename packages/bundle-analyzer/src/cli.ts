#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createAndUploadReport } from "./index.js";
import { red, type Options } from "@codecov/bundler-plugin-core";
import { type BundleAnalyzerOptions } from "./options";

interface Argv extends BaseArgs, ConfigFileArgs {}

// Base arguments that can be supplied in a flag or an optional config file. These are the more common configurations options
interface BaseArgs {
  buildDirectories: string[];

  // Bundle Analyzer Options
  ignorePatterns?: string[];
  normalizeAssetsPattern?: string;

  // Core Options
  apiUrl?: string;
  uploadToken?: string;
  bundleName: string;
  debug?: boolean;
  dryRun?: boolean;

  configFile?: string;
}

// ConfigFileArgs arguments that can be supplied in an optional config file. These are less common configurations options
interface ConfigFileArgs {
  // Core Options
  retryCount?: number;
  enableBundleAnalysis?: boolean;
  gitService?: string;
  uploadOverridesBranch?: string;
  uploadOverridesBuild?: string;
  uploadOverridesPr?: string;
  uploadOverridesCompareSha?: string;
  uploadOverridesSha?: string;
  uploadOverridesSlug?: string;
  oidcUseGitHubOIDC?: boolean;
  oidcGitHubOIDCTokenAudience?: string;
}

const baseArgs = yargs(hideBin(process.argv))
  .usage("Usage: $0 <build-directories> [options]")
  .command(
    "$0 <build-directories...>",
    "Analyze and upload bundle report",
    (yargs) => {
      return yargs.positional("buildDirectories", {
        describe: "The paths to the build directories (can be multiple)",
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
    "config-file": {
      alias: "c",
      type: "string",
      description: "Path to a JSON configuration file",
    },
  })
  .strict()
  .help("h")
  .alias("h", "help")
  .parseSync() as unknown as BaseArgs;

const getConfigFileArgs = (filePath: string): Partial<ConfigFileArgs> => {
  try {
    const configContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(configContent) as Partial<ConfigFileArgs>;
  } catch (error) {
    red(`Failed to load configuration file: ${error}`);
    process.exit(1);
  }
};

const addConfigFileArgs = (baseArgs: BaseArgs): Argv => {
  let configFromFile: ConfigFileArgs | undefined;
  if (baseArgs.configFile) {
    configFromFile = getConfigFileArgs(baseArgs.configFile);
  }

  // Merge CLI flag arguments with config file values (CLI flag takes precedence)
  const mergedArgs: Argv = {
    ...configFromFile,
    ...baseArgs,
  };

  return mergedArgs;
};

const prepareCoreOptions = (argv: Argv): Options => {
  return {
    apiUrl: argv.apiUrl,
    // @ts-expect-error - validate value at normalizeOptions
    gitService: argv.gitService,
    dryRun: argv.dryRun,
    uploadToken: argv.uploadToken ?? process.env.CODECOV_UPLOAD_TOKEN,
    retryCount: argv.retryCount,
    bundleName: argv.bundleName ?? "",
    enableBundleAnalysis: argv.enableBundleAnalysis,
    debug: argv.debug,
    uploadOverrides: {
      branch: argv.uploadOverridesBranch,
      build: argv.uploadOverridesBuild,
      compareSha: argv.uploadOverridesCompareSha,
      pr: argv.uploadOverridesPr,
      sha: argv.uploadOverridesSha,
      slug: argv.uploadOverridesSlug,
    },
    oidc: {
      useGitHubOIDC: argv.oidcUseGitHubOIDC ?? false,
      gitHubOIDCTokenAudience: argv.oidcGitHubOIDCTokenAudience,
    },
  };
};

const prepareBundleAnalyzerOptions = (argv: Argv): BundleAnalyzerOptions => {
  return {
    ignorePatterns: argv.ignorePatterns,
    normalizeAssetsPattern: argv.normalizeAssetsPattern,
  };
};

export const runCli = async (baseArgs: BaseArgs): Promise<void> => {
  const argv = addConfigFileArgs(baseArgs);

  if (argv.buildDirectories.length === 0) {
    red("Error: No build directories provided.");
    process.exit(1);
  }

  const resolvedDirectoryPaths = argv.buildDirectories.map((dir) =>
    path.resolve(process.cwd(), dir),
  );

  const coreOptions = prepareCoreOptions(argv);
  const bundleAnalyzerOptions = prepareBundleAnalyzerOptions(argv);

  const reportAsJson = await createAndUploadReport(
    resolvedDirectoryPaths,
    coreOptions,
    bundleAnalyzerOptions,
  );

  if (coreOptions.dryRun) {
    // eslint-disable-next-line no-console
    console.log(reportAsJson);
  }
};

runCli(baseArgs).catch((error) => {
  red(`An error occurred: ${error}`);
  process.exit(1);
});
