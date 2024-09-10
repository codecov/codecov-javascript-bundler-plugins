import { createAndUploadReport } from "@codecov/bundle-analyzer";

const buildDir =
  "../../../integration-tests/test-apps/bundle-analyzer/dotenv-vercel/dist";

const apiUrl = process.env.API_URL || "https://api.codecov.io";

const coreOpts = {
  dryRun: false,
  uploadToken: "your-upload-token",
  retryCount: 3,
  apiUrl: apiUrl,
  bundleName: "bundle-analyzer",
  enableBundleAnalysis: true,
  debug: true,
};

const bundleAnalyzerOpts = {
  beforeReportUpload: async (original) => original,
};

createAndUploadReport(buildDir, coreOpts, bundleAnalyzerOpts)
  .then((reportAsJson) =>
    console.log(`Report successfully generated and uploaded: ${reportAsJson}`),
  )
  .catch((error) =>
    console.error("Failed to generate or upload report:", error),
  );
