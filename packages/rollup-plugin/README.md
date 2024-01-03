<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Rollup Plugin

> [!WARNING]  
> These plugins are currently in alpha and are subject to change.

> A Rollup plugin that provides bundle analysis support for Codecov.

## Installation

Using npm:

```bash
npm install @codecov/rollup-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/rollup-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/rollup-plugin --save-dev
```

## Example

```js
// rollup.config.js
import { defineConfig } from "rollup";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov rollup plugin after all other plugins
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rollup-bundle",
      globalUploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
