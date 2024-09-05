import {
  normalizeOptions,
  Output,
  type Options,
  type NormalizedOptions,
} from "@codecov/bundler-plugin-core";
import { PLUGIN_NAME, PLUGIN_VERSION } from "./version";
import { normalizeStandaloneOptions, type StandaloneOptions } from "./options";
import { getAssets } from "./assets";

/**
 * Generates a Codecov bundle stats report and optionally uploads it to Codecov. This function can
 * be imported into your code or used via the standalone-analyzer CLI.
 *
 * @param {string} buildDirectoryPath - The path to the build directory containing the production
 *        assets for the report. Can be absolute or relative.
 * @param {Options} coreOptions - Configuration options for generating and uploading the report.
 * @param {StandaloneOptions} [standaloneOptions] - Optional configuration for standalone usage.
 *
 * @returns {Promise<void>} A promise that resolves when the report is generated and uploaded
 *          (dry-runned or uploaded).
 *
 * @example
 * const buildDir = '/path/to/build/directory'; // absolute or relative path
 * const coreOpts = {
 *   dryRun: true,
 *   uploadToken: 'your-upload-token',
 *   retryCount: 3,
 *   apiUrl: 'https://api.codecov.io',
 *   bundleName: 'my-bundle', // bundle identifier in Codecov
 *   enableBundleAnalysis: true,
 *   debug: true,
 * };
 * const standaloneOpts = {
 *   beforeReportUpload: async (original) => original,
 * };
 *
 * createAndUploadReport(buildDir, coreOpts, standaloneOpts)
 *   .then(() => console.log('Report successfully generated and uploaded.'))
 *   .catch((error) => console.error('Failed to generate or upload report:', error));
 */
export const createAndUploadReport = async (
  buildDirectoryPath: string,
  coreOptions: Options,
  standaloneOptions?: StandaloneOptions,
): Promise<string> => {
  // normalize options
  const standaloneOpts = normalizeStandaloneOptions(standaloneOptions);
  const coreOpts = normalizeOptions(coreOptions);
  if (!coreOpts.success) {
    throw new Error("Invalid options: " + coreOpts.errors.join(" "));
  }

  // create report
  const initialReport: Output = await makeReport(
    buildDirectoryPath,
    coreOpts.options,
  );

  // override report as needed (by default returns unchanged)
  const finalReport = await standaloneOpts.beforeReportUpload(initialReport);

  // handle report
  if (!coreOptions.dryRun) {
    await finalReport.write();
  }

  return finalReport.bundleStatsToJson();
};

/* makeReport creates the output bundle stats report */
const makeReport = async (
  buildDirectoryPath: string,
  normalizedCoreOptions: NormalizedOptions,
): Promise<Output> => {
  // initialize report
  const output: Output = new Output(normalizedCoreOptions);
  output.start();
  output.setPlugin(PLUGIN_NAME, PLUGIN_VERSION);

  // handle assets
  output.assets = await getAssets(buildDirectoryPath);

  // handle chunks and modules (not supported at this time)
  output.chunks = [];
  output.modules = [];

  // close and return report
  output.end();
  return output;
};
