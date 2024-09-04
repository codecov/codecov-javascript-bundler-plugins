import { CreateAndHandleReport } from "@codecov/standalone-analyzer";

const buildDir =
  "../../../integration-tests/test-apps/standalone/dotenv-vercel/dist";

const apiUrl = process.env.API_URL || "https://api.codecov.io";

const coreOpts = {
  dryRun: false,
  uploadToken: "your-upload-token",
  retryCount: 3,
  apiUrl: apiUrl,
  bundleName: "standalone",
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
