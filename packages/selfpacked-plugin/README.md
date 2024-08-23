<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Self-packed / No-bundler Plugin

> [!WARNING]  
> These plugins are currently in beta and are subject to change.

> A generic plugin that provides bundle analysis support for Codecov if you don't use a standard bundler (e.g., vite, webpack).
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/selfpacked-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/selfpacked-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/selfpacked-plugin --save-dev
```

## Example

```js
// vite.config.js
import { defineConfig } from "vite";
import { codecovSelfpackedPlugin } from "@codecov/selfpacked-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov self-packed plugin after all other plugins
    codecovSelfpackedPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-selfpacked",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
