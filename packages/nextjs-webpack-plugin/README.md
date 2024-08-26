<p align="center">
  <a href="https://about.codecov.io" target="_blank">
    <img src="https://about.codecov.io/wp-content/themes/codecov/assets/brand/sentry-cobranding/logos/codecov-by-sentry-logo.svg" alt="Codecov by Sentry logo" width="280" height="84">
  </a>
</p>

# Codecov NextJS (Webpack) Plugin

> [!WARNING]  
> These plugins are currently in beta and are subject to change.

> A NextJS (Webpack) plugin that provides bundle analysis support for Codecov.
>
> The plugin does not support code coverage, see our [docs](https://docs.codecov.com/docs/quick-start) to set up coverage today!

## Installation

Using npm:

```bash
npm install @codecov/nextjs-webpack-plugin --save-dev
```

Using yarn:

```bash
yarn add @codecov/nextjs-webpack-plugin --dev
```

Using pnpm:

```bash
pnpm add @codecov/nextjs-webpack-plugin --save-dev
```

## Tokenless Example

This configuration will automatically upload the bundle analysis to Codecov. See the [below configuration](#upload-token-example---required-for-private-repositories) for private repositories.

```typescript
// next.config.mjs
import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

export default {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "example-nextjs-webpack-bundle",
        gitService: "github",
        webpack: options.webpack,
      }),
    );

    return config;
  },
};
```

## Upload Token Example - Required for Private Repositories

This is the required way to use the plugin for private repositories. This configuration will automatically upload the bundle analysis to Codecov.

```typescript
// next.config.mjs
import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

export default {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "example-nextjs-webpack-bundle",
        uploadToken: process.env.CODECOV_TOKEN,
        webpack: options.webpack,
      }),
    );

    return config;
  },
};
```

## More information

- [NextJS Config Docs](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Codecov Documentation](https://docs.codecov.com/docs)
- [Codecov Feedback](https://github.com/codecov/feedback/discussions)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
