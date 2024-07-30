<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov SolidStart Plugin

> [!WARNING]
> These plugins are currently in beta and are subject to change.
>
> A SolidStart plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

> [!NOTE]
> This plugin only supports SolidStart 1.x when building with Vite.

## Installation

Using npm:

```bash
npm install @codecov/solidstart-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/solidstart-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/solidstart-plugin --save-dev
```

## Example

```ts
// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import solidPlugin from "vite-plugin-solid";
import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";

export default defineConfig({
  vite: {
    plugins: [
      // Put the Codecov SolidStart plugin after all other plugins
      solidPlugin(),
      codecovSolidStartPlugin({
        enableBundleAnalysis: true,
        bundleName: "example-solidstart-bundle",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
  },
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
