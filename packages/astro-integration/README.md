<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Astro Integration

An Astro integration that provides bundle analysis support for Codecov.

> [!NOTE]
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npx astro add @codecov/astro-integration
```

Using yarn:

```bash
yarn astro add @codecov/astro-integration
```

Using pnpm:

```bash
pnpm astro add @codecov/astro-integration
```

## Public Repo Example - GitHub Actions

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { codecovAstroIntegration } from "@codecov/astro-integration";

// https://astro.build/config
export default defineConfig({
  // other config settings
  integrations: [
    // place this after all other integrations
    codecovAstroIntegration({
      enableBundleAnalysis: true,
      bundleName: "example-astro-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
      gitService: "github",
    }),
  ],
});
```

## Public Repo Example - Non-GitHub Actions

This setup is for public repositories that are not using GitHub Actions, this configuration will automatically upload the bundle analysis to Codecov. You will need to configure the it similar to the GitHub Actions example, however you will need to provide a branch override, and ensure that it will pass the correct branch name, and with forks including the fork-owner i.e. `fork-owner:branch`.

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { codecovAstroIntegration } from "@codecov/astro-integration";

// https://astro.build/config
export default defineConfig({
  // other config settings
  integrations: [
    // place this after all other integrations
    codecovAstroIntegration({
      enableBundleAnalysis: true,
      bundleName: "example-astro-bundle",
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

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { codecovAstroIntegration } from "@codecov/astro-integration";

// https://astro.build/config
export default defineConfig({
  // other config settings
  integrations: [
    // place this after all other integrations
    codecovAstroIntegration({
      enableBundleAnalysis: true,
      bundleName: "example-astro-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## OIDC Configuration Example

For users with [OpenID Connect (OIDC) enabled](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect), setting the `uploadToken` is not necessary. You can use OIDC with the `oidc` configuration as following.

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { codecovAstroIntegration } from "@codecov/astro-integration";

// https://astro.build/config
export default defineConfig({
  // other config settings
  integrations: [
    // place this after all other integrations
    codecovAstroIntegration({
      enableBundleAnalysis: true,
      bundleName: "example-astro-bundle",
      oidc: {
        useGitHubOIDC: true,
      },
    }),
  ],
});
```

## More information

- [Astro Integration Docs](https://codecov.github.io/codecov-javascript-bundler-plugins/modules/_codecov_astro_integration.html)
- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
