<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Bundle Analyzer

> [!WARNING]
> This bundle-analyzer package is subject to change.
>
> An importable library + CLI for Codecov bundle analysis support.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/bundle-analyzer --save-dev
```

Using yarn:

```bash
yarn add @codecov/bundle-analyzer --dev
```

Using pnpm:

```bash
pnpm add @codecov/bundle-analyzer --save-dev
```

## Example

This example shows how the package can be imported as a library.

```js
// analyze.js
const { createAndUploadReport } = require("@codecov/bundle-analyzer");

const buildDirs = ["/path/to/build"];

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
```

This example shows how the package can be used as a CLI.

```
npx @codecov/bundle-analyzer ./dist --bundle-name=my-identifier --upload-token=abcd --dry-run
```

## Supported Platforms

The CLI tool supports the following operating systems:

- macOS
- Linux

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
