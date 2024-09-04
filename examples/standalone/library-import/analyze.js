import { CreateAndHandleReport } from "@codecov/standalone-analyzer";

const buildDir = "../../../examples/standalone/cli/dist";

const coreOpts = {
  dryRun: true,
  uploadToken: "your-upload-token",
  retryCount: 3,
  apiUrl: "https://api.codecov.io",
  bundleName: "my-bundle", // bundle identifier in Codecov
  enableBundleAnalysis: true,
  debug: true,
};

const standaloneOpts = {
  dryRunner: async (report) =>
    console.info("Dry run output: ", report.bundleStatsToJson()),
  reportOverrider: async (original) => original,
};

CreateAndHandleReport(buildDir, coreOpts, standaloneOpts)
  .then(() => console.log("Report successfully generated and handled."))
  .catch((error) =>
    console.error("Failed to generate or upload report:", error),
  );
