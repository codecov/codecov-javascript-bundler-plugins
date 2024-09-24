import {
  BundleAnalyzerOptions,
  createAndUploadReport,
  Options,
} from "@codecov/bundle-analyzer";

const buildDirs = ["../../examples/bundle-analyzer-lib-esm/example-dist"];

const coreOpts: Options = {
  dryRun: false,
  uploadToken: process.env.BUNDLE_ANALYZER_UPLOAD_TOKEN,
  retryCount: 3,
  apiUrl: process.env.BUNDLE_ANALYZER_API_URL,
  bundleName: "@codecov/example-bundle-analyzer-esm",
  enableBundleAnalysis: true,
  debug: true,
};

const bundleAnalyzerOpts: BundleAnalyzerOptions = {
  beforeReportUpload: async (original) => original,
  ignorePatterns: ["*.map"],
  normalizeAssetsPattern: "[name]-[hash].js",
};

createAndUploadReport(buildDirs, coreOpts, bundleAnalyzerOpts)
  .then((reportAsJson) =>
    console.log(`Report successfully generated and uploaded: ${reportAsJson}`),
  )
  .catch((error) =>
    console.error("Failed to generate or upload report:", error),
  );
