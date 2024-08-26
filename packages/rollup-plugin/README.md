<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Rollup Plugin

> [!WARNING]  
> These plugins are currently in beta and are subject to change.

> A Rollup plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/rollup-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/rollup-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/rollup-plugin --save-dev
```

## Tokenless Example

This configuration will automatically upload the bundle analysis to Codecov. See the [below configuration](#upload-token-example---required-for-private-repositories) for private repositories.

```js
// rollup.config.js
import { defineConfig } from "rollup";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov rollup plugin after all other plugins
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rollup-bundle",
      gitService: "github",
    }),
  ],
});
```

## Upload Token Example - Required for Private Repositories

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

```js
// rollup.config.js
import { defineConfig } from "rollup";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov rollup plugin after all other plugins
    codecovRollupPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-rollup-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
```

## More information

- [Rollup Config Docs](https://codecov.github.io/codecov-javascript-bundler-plugins/modules/_codecov_rollup_plugin.html)
- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
