const { createAndUploadReport } = require("@codecov/bundle-analyzer");

const buildDirs = ["../../../examples/bundle-analyzer/cli/dist"];

const coreOpts = {
  dryRun: true,
  uploadToken: "your-upload-token",
  retryCount: 3,
  apiUrl: "https://api.codecov.io",
  bundleName: "@codecov/example-bundle-analyzer-cjs",
  enableBundleAnalysis: true,
  debug: true,
};

const bundleAnalyzerOpts = {
  beforeReportUpload: async (original) => original,
};

createAndUploadReport(buildDirs, coreOpts, bundleAnalyzerOpts)
  .then((reportAsJson) =>
    console.log(`Report successfully generated and uploaded: ${reportAsJson}`),
  )
  .catch((error) =>
    console.error("Failed to generate or upload report:", error),
  );
