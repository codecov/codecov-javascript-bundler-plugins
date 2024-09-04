<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Standalone Analyzer

> [!WARNING]
> These plugins are currently in beta and are subject to change.
>
> An importable library + CLI for Codecov bundle analysis support.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/standalone-analyzer --save-dev
```

Using yarn:

```bash
yarn add @codecov/standalone-analyzer --dev
```

Using pnpm:

```bash
pnpm add @codecov/standalone-analyzer --save-dev
```

## Example

```js
// analyze.js
import { CreateAndHandleReport } from "@codecov/standalone-analyzer";

const buildDir = "path/to/build";

const coreOpts = {
  dryRun: false,
  uploadToken: "your-upload-token",
  retryCount: 3,
  apiUrl: "https://localhost:3000",
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
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
