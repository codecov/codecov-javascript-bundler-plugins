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
> This plugin only supports Remix 2.x when building with Vite.

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

## Public Repo Example - GitHub Actions

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

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
      gitService: "github",
    }),
  ],
});
```

## Public Repo Example - Non-GitHub Actions

This setup is for public repositories that are not using GitHub Actions, this configuration will automatically upload the bundle analysis to Codecov. You will need to configure the it similar to the GitHub Actions example, however you will need to provide a branch override, and ensure that it will pass the correct branch name, and with forks including the fork-owner i.e. `fork-owner:branch`.

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

## OIDC Configuration Example

For users with [OpenID Connect (OIDC) enabled](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect), setting the `uploadToken` is not necessary. You can use OIDC with the `oidc` configuration as following.

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
      oidc: {
        useGitHubOIDC: true,
      },
    }),
  ],
});
```

## More information

- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
