<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov Webpack Plugin

> [!WARNING]  
> These plugins are currently in beta and are subject to change.

> A Webpack plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/webpack-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/webpack-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/webpack-plugin --save-dev
```

## Example

```js
// webpack.config.js
const path = require("path");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    // Put the Codecov vite plugin after all other plugins
    codecovWebpackPlugin({
      enableBundleAnalysis: true,
      bundleName: "example-webpack-bundle",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
};
```

## More information

- [Webpack Config Docs](https://codecov.github.io/codecov-javascript-bundler-plugins/modules/_codecov_webpack_plugin.html)
- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
