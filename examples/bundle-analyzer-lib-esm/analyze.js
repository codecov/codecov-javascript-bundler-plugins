import { createAndUploadReport } from "@codecov/bundle-analyzer";

const buildDirs = ["../../../examples/bundle-analyzer-lib-esm/example-dist"];

const coreOpts = {
  dryRun: false,
  retryCount: 3,
  apiUrl: "https://api.codecov.io",
  bundleName: "@codecov/example-bundle-analyzer-esm",
  enableBundleAnalysis: true,
  debug: true,
  // pick up uploadToken from environment
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
