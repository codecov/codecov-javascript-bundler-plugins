import { createAndUploadReport } from "@codecov/standalone-analyzer";

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
  beforeReportUpload: async (original) => original,
};

createAndUploadReport(buildDir, coreOpts, standaloneOpts)
  .then((reportAsJson) =>
    console.log(`Report successfully generated and uploaded: ${reportAsJson}`),
  )
  .catch((error) =>
    console.error("Failed to generate or upload report:", error),
  );
