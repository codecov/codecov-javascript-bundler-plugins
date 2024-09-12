import {
  createAndUploadReport,
  type BundleAnalyzerOptions,
  type Options,
} from "@codecov/bundle-analyzer";

const buildDirs: string[] = [
  "../../../examples/bundle-analyzer-lib-cjs/example-dist",
];

const coreOpts: Options = {
  dryRun: false,
  uploadToken: process.env.BUNDLE_ANALYZER_UPLOAD_TOKEN as string,
  retryCount: 3,
  apiUrl: "https://api.codecov.io",
  bundleName: "@codecov/example-bundle-analyzer-cjs",
  enableBundleAnalysis: true,
  debug: true,
};

const bundleAnalyzerOpts: BundleAnalyzerOptions = {
  beforeReportUpload: async (original: any) => original,
  ignorePatterns: ["*.map"],
  normalizeAssetsPattern: "[name]-[hash].js",
};

createAndUploadReport(buildDirs, coreOpts, bundleAnalyzerOpts)
  .then((reportAsJson: string) =>
    console.log(`Report successfully generated and uploaded: ${reportAsJson}`),
  )
  .catch((error: Error) =>
    console.error("Failed to generate or upload report:", error),
  );
