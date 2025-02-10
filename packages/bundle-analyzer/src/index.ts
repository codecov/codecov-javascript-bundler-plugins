import {
  normalizeOptions,
  Output,
  type Options,
  type NormalizedOptions,
} from "@codecov/bundler-plugin-core";
import { PLUGIN_NAME, PLUGIN_VERSION } from "./version";
import {
  normalizeBundleAnalyzerOptions,
  type NormalizedBundleAnalyzerOptions,
  type BundleAnalyzerOptions,
} from "./options";
import { getAssets } from "./assets";

export { type Options } from "@codecov/bundler-plugin-core";
export { type BundleAnalyzerOptions } from "./options";

/**
 * Generates a Codecov bundle stats report and optionally uploads it to Codecov. This function can
 * be imported into your code or used via the bundle-analyzer CLI.
 *
 * @param {string[]} buildDirectoryPaths - The path(s) to the build directory or directories
 *        containing the production assets for the report. Can be absolute or relative.
 * @param {Options} coreOptions - Configuration options for generating and uploading the report.
 * @param {BundleAnalyzerOptions} [bundleAnalyzerOptions] - Optional configuration for
 *        bundle-analyzer usage.
 *
 * @returns {Promise<string>} A promise that resolves when the report is generated and uploaded
 *          (dry-runned or uploaded).
 *
 * @example
 * const buildDirs = ['/path/to/build/directory', '/path/to/another/build']; // absolute or relative paths
 * const coreOpts = {
 *   dryRun: true,
 *   uploadToken: 'your-upload-token',
 *   retryCount: 3,
 *   apiUrl: 'https://api.codecov.io',
 *   bundleName: 'my-bundle', // bundle identifier in Codecov
 *   enableBundleAnalysis: true,
 *   debug: true,
 * };
 * const bundleAnalyzerOpts = {
 *   beforeReportUpload: async (original) => original,
 *   ignorePatterns: ["*.map"],
 *   normalizeAssetsPattern: "[name]-[hash].js",
 * };
 *
 * createAndUploadReport(buildDirs, coreOpts, bundleAnalyzerOpts)
 *   .then(() => console.log('Report successfully generated and uploaded.'))
 *   .catch((error) => console.error('Failed to generate or upload report:', error));
 */
export const createAndUploadReport = async (
  buildDirectoryPaths: string[],
  coreOptions: Options,
  bundleAnalyzerOptions?: BundleAnalyzerOptions,
): Promise<string> => {
  const coreOpts = normalizeOptions(coreOptions);
  if (!coreOpts.success) {
    throw new Error("Invalid options: " + coreOpts.errors.join(" "));
  }
  const bundleAnalyzerOpts = normalizeBundleAnalyzerOptions(
    bundleAnalyzerOptions,
  );

  const initialReport = await createReport(
    buildDirectoryPaths,
    coreOpts.options,
    bundleAnalyzerOpts,
  );

  // Override report as needed (by default returns unchanged)
  let finalReport: Output;
  try {
    finalReport = await bundleAnalyzerOpts.beforeReportUpload(initialReport);
  } catch (error) {
    throw new Error(`Error in beforeReportUpload: ${error}`);
  }

  if (!coreOptions.dryRun) {
    await finalReport.write(true);
  }

  return finalReport.bundleStatsToJson();
};

/* createReport creates the output bundle stats report */
const createReport = async (
  buildDirectoryPaths: string[],
  normalizedCoreOptions: NormalizedOptions,
  normalizedBundleAnalyzerOptions: NormalizedBundleAnalyzerOptions,
): Promise<Output> => {
  // initialize report
  const output: Output = new Output(normalizedCoreOptions, {
    metaFramework: "bundle-analyzer",
  });
  output.start();
  output.setPlugin(PLUGIN_NAME, PLUGIN_VERSION);

  // handle assets
  output.assets = await getAssets(
    buildDirectoryPaths,
    normalizedBundleAnalyzerOptions.ignorePatterns,
    normalizedBundleAnalyzerOptions.normalizeAssetsPattern,
  );

  // handle chunks and modules (not supported at this time)
  output.chunks = [];
  output.modules = [];

  // close and return report
  output.end();
  return output;
};
