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

## Public Repo Example - GitHub Actions

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

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
      gitService: "github",
    }),
  ],
});
```

## Public Repo Example - Non-GitHub Actions

This setup is for public repositories that are not using GitHub Actions, this configuration will automatically upload the bundle analysis to Codecov. You will need to configure the it similar to the GitHub Actions example, however you will need to provide a branch override, and ensure that it will pass the correct branch name, and with forks including the fork-owner i.e. `fork-owner:branch`.

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
      gitService: "github",
      uploadOverrides: {
        branch: "<branch value>",
      },
    }),
  ],
});
```

## Private Repo Example

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

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

## Tokenless Example

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

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
      gitService: "github",
    }),
  ],
});
```

## Public Repo Example - Non-GitHub Actions

This setup is for public repositories that are not using GitHub Actions, this configuration will automatically upload the bundle analysis to Codecov. You will need to configure the it similar to the GitHub Actions example, however you will need to provide a branch override, and ensure that it will pass the correct branch name, and with forks including the fork-owner i.e. `fork-owner:branch`.

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
      gitService: "github",
      uploadOverrides: {
        branch: "<branch value>",
      },
    }),
  ],
});
```

## Private Repo Example

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

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
