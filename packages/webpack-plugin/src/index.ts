/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UnpluginOptions,
  createWebpackPlugin,
  type WebpackPluginInstance,
} from "unplugin";
import {
  normalizeOptions,
  red,
  type Options,
  checkNodeVersion,
  Output,
} from "@codecov/bundler-plugin-core";

import { webpackBundleAnalysisPlugin } from "./webpack-bundle-analysis/webpackBundleAnalysisPlugin";

const codecovWebpackPluginFactory = createWebpackPlugin<Options, true>(
  (userOptions, unpluginMetaContext) => {
    if (checkNodeVersion(unpluginMetaContext)) {
      return [];
    }

    const normalizedOptions = normalizeOptions(userOptions);
    if (!normalizedOptions.success) {
      for (const error of normalizedOptions.errors) {
        red(error);
      }
      return [];
    }

    const plugins: UnpluginOptions[] = [];
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options?.enableBundleAnalysis) {
      plugins.push(
        webpackBundleAnalysisPlugin({
          output,
        }),
      );
    }

    return plugins;
  },
);

/**
 * Details for the Codecov Webpack plugin.
 *
 * @example
 * ```typescript
 * // webpack.config.js
 * const path = require("path");
 * const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");
 *
 * module.exports = {
 *   entry: "./src/index.js",
 *   mode: "production",
 *   output: {
 *     filename: "main.js",
 *     path: path.resolve(__dirname, "dist"),
 *   },
 *   plugins: [
 *     // Put the Codecov vite plugin after all other plugins
 *     codecovWebpackPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-webpack-bundle",
 *       uploadToken: process.env.CODECOV_TOKEN,
 *     }),
 *    ],
 * };
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovWebpackPlugin: (options: Options) => WebpackPluginInstance =
  codecovWebpackPluginFactory;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * @access package
 */
export const _internal_webpackPlugin = webpackBundleAnalysisPlugin;
