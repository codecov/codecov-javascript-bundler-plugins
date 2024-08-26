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

## Public Repo Example - GitHub Actions

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

```typescript
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
        gitService: "github",
      },
    ],
  ],
});
```

## Public Repo Example - Non-GitHub Actions

This setup is for public repositories that are not using GitHub Actions, this configuration will automatically upload the bundle analysis to Codecov. You will need to configure the it similar to the GitHub Actions example, however you will need to provide a branch override, and ensure that it will pass the correct branch name, and with forks including the fork-owner i.e. `fork-owner:branch`.

```typescript
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
        gitService: "github",
        uploadOverrides: {
          branch: "<branch value>",
        },
      },
    ],
  ],
});
```

## Private Repo Example

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

```typescript
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
