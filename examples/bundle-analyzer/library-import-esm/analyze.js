import { createAndUploadReport } from "@codecov/bundle-analyzer";

const buildDir = "../../../examples/bundle-analyzer/cli/dist";

const coreOpts = {
  dryRun: true,
  uploadToken: "your-upload-token",
  retryCount: 3,
  apiUrl: "https://api.codecov.io",
  bundleName: "my-bundle", // bundle identifier in Codecov
  enableBundleAnalysis: true,
  debug: true,
};

const bundleAnalyzerOpts = {
  reportOverrider: async (original) => original,
};

createAndUploadReport(buildDir, coreOpts, bundleAnalyzerOpts)
  .then((reportAsJson) =>
    console.log(`Report successfully generated and uploaded: ${reportAsJson}`),
  )
  .catch((error) =>
    console.error("Failed to generate or upload report:", error),
  );
