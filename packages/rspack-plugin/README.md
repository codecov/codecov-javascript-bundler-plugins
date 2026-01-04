<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Rspack Plugin

A Rspack plugin that provides bundle analysis support for Codecov.

> [!NOTE]
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/rspack-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/rspack-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/rspack-plugin --save-dev
```

## Public Repo Example - GitHub Actions

This configuration will automatically upload the bundle analysis to Codecov for public repositories. When an internal PR is created it will use the Codecov token set in your secrets, and if running from a forked PR, it will use the tokenless setting automatically. For setups not using GitHub Actions see the following [example](#public-repo-example---non-github-actions). For private repositories see the following [example](#private-repo-example).

```js
// rspack.config.js
const path = require("path");
const { codecovRspackPlugin } = require("@codecov/rspack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Put the Codecov rspack plugin after all other plugins
    codecovRspackPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rspack-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
      gitService: "github",
    }),
  ],
};
```

## Public Repo Example - Non-GitHub Actions

This setup is for public repositories that are not using GitHub Actions, this configuration will automatically upload the bundle analysis to Codecov. You will need to configure it similar to the GitHub Actions example, however you will need to provide a branch override, and ensure that it will pass the correct branch name, and with forks including the fork-owner i.e. `fork-owner:branch`.

```js
// rspack.config.js
const path = require("path");
const { codecovRspackPlugin } = require("@codecov/rspack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Put the Codecov rspack plugin after all other plugins
    codecovRspackPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rspack-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
      gitService: "github",
      uploadOverrides: {
        branch: "<branch value>",
      },
    }),
  ],
};
```

## Private Repo Example

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

```js
// rspack.config.js
const path = require("path");
const { codecovRspackPlugin } = require("@codecov/rspack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Put the Codecov rspack plugin after all other plugins
    codecovRspackPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rspack-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
      gitService: "github",
    }),
  ],
};
```

## GitHub OIDC

For GitHub Actions users, you can use OIDC instead of a upload token. This is the recommended approach for GitHub Actions.

```js
// rspack.config.js
const path = require("path");
const { codecovRspackPlugin } = require("@codecov/rspack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Put the Codecov rspack plugin after all other plugins
    codecovRspackPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rspack-bundle",
      oidc: {
        useGitHubOIDC: true,
      },
    }),
  ],
};
```

See the [full documentation](https://docs.codecov.com/docs/bundle-analysis) for more details.
