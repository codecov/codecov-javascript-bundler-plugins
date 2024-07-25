<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov SvelteKit Plugin

> [!WARNING]
> These plugins are currently in beta and are subject to change.
>
> A SvelteKit plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

> [!NOTE]
> This plugin only supports SvelteKit 2.x when building with Vite.

## Installation

Using npm:

```bash
npm install @codecov/sveltekit-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/sveltekit-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/sveltekit-plugin --save-dev
```

## Example

```ts
// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { codecovSvelteKitPlugin } from "@codecov/sveltekit-plugin";

export default defineConfig({
  plugins: [
    sveltekit(),
    // Put the Codecov SvelteKit plugin after all other plugins
    codecovSvelteKitPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-sveltekit-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
