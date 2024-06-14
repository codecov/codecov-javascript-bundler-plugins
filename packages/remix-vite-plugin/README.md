<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Remix Plugin

> [!WARNING]
> These plugins are currently in beta and are subject to change.
>
> A Remix plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

> [!NOTE]
> This plugin only support Remix 2.x when building with Vite.

## Installation

Using npm:

```bash
npm install @codecov/remix-vite-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/remix-vite-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/remix-vite-plugin --save-dev
```

## Example

```ts
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { codecovRemixPlugin } from "@codecov/remix-vite-plugin";

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths()
    // Put the Codecov Remix plugin after all other plugins
    codecovRemixPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-remix-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
