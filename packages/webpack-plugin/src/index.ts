/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";

import { webpackBundleAnalysisPlugin } from "./webpack-bundle-analysis/webpackBundleAnalysisPlugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: webpackBundleAnalysisPlugin,
});

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
export const codecovWebpackPlugin: (options: Options) => any =
  codecovUnplugin.webpack;
