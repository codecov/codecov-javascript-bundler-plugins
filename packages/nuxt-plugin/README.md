<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Nuxt Plugin

> [!WARNING]
> These plugins are currently in beta and are subject to change.
>
> A Nuxt plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

> [!NOTE]
> This plugin only supports Nuxt 3.x when building with Vite.

## Installation

Using npm:

```bash
npm install @codecov/nuxt-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/nuxt-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/nuxt-plugin --save-dev
```

## Tokenless Example

This configuration will automatically upload the bundle analysis to Codecov. See the [below configuration](#upload-token-example---required-for-private-repositories) for private repositories.

```js
// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  // Ensure that the builder is set to "vite"
  builder: "vite",
  // Ensure that the plugin is added to the modules array
  modules: [
    [
      "@codecov/nuxt-plugin",
      {
        enableBundleAnalysis: true,
        bundleName: "nuxt-bundle-analysis",
        gitService: "github",
      },
    ],
  ],
});
```

## Upload Token Example - Required for Private Repositories

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

```js
// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  // Ensure that the builder is set to "vite"
  builder: "vite",
  // Ensure that the plugin is added to the modules array
  modules: [
    [
      "@codecov/nuxt-plugin",
      {
        enableBundleAnalysis: true,
        bundleName: "nuxt-bundle-analysis",
        uploadToken: process.env.CODECOV_UPLOAD_TOKEN,
      },
    ],
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
