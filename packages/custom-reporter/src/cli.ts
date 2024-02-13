#!/usr/bin/env node

import path from "node:path";
import { createAndUploadBundleAnalysisReport } from "./index.ts";

const args = process.argv.slice(2);
const directoryPath = args[0];
const apiUrl = args[1];
const dryRun = args.includes("--dry-run");
const enableBundleAnalysis = args.includes("--enable-bundle-analysis");
const debug = args.includes("--debug");

if (!directoryPath || !apiUrl) {
  console.error("directory path and api url required");
  process.exit(1);
}

const userOptions = {
  apiUrl: apiUrl,
  dryRun: dryRun,
  enableBundleAnalysis: enableBundleAnalysis,
  debug: debug,
};

const resolvedDirectoryPath = path.resolve(process.cwd(), directoryPath);

(async () => {
  try {
    await createAndUploadBundleAnalysisReport(
      resolvedDirectoryPath,
      userOptions,
    );
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
})();
