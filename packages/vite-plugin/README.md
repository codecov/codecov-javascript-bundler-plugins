<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Bundler Vite Plugin

> [!WARNING]  
> These plugins are currently in alpha and are subject to change.

> A Vite plugin that provides bundle analysis support for Codecov.

## Installation

Using npm:

```bash
npm install @codecov/vite-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/vite-plugin --dev
```

Using pnpm

```bash
pnpm add @codecov/vite-plugin --save-dev
```

## Example

```js
// vite.config.js
import { defineConfig } from "vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov vite plugin after all other plugins
    codecovVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "example-vite-bundle",
      globalUploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
