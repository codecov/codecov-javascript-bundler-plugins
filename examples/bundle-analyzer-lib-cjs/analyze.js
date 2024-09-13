const { createAndUploadReport } = require("@codecov/bundle-analyzer");

const buildDirs = ["../../examples/bundle-analyzer-lib-cjs/example-dist"];

const coreOpts = {
  dryRun: false,
  uploadToken: process.env.BUNDLE_ANALYZER_UPLOAD_TOKEN,
  retryCount: 3,
  apiUrl: "https://api.codecov.io",
  bundleName: "@codecov/example-bundle-analyzer-cjs",
  enableBundleAnalysis: true,
  debug: true,
};

const bundleAnalyzerOpts = {
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
