/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UnpluginOptions,
  createWebpackPlugin,
  type WebpackPluginInstance,
} from "unplugin";
import {
  normalizeOptions,
  type Options,
  checkNodeVersion,
  Output,
  handleErrors,
} from "@codecov/bundler-plugin-core";

import { webpackBundleAnalysisPlugin } from "./webpack-bundle-analysis/webpackBundleAnalysisPlugin";

import {
  findFilenameFormat,
  processAssets,
  processChunks,
  processModules,
} from "./webpack-bundle-analysis/utils";

const codecovWebpackPluginFactory = createWebpackPlugin<Options, true>(
  (userOptions, unpluginMetaContext) => {
    if (checkNodeVersion(unpluginMetaContext)) {
      return [];
    }

    const normalizedOptions = normalizeOptions(userOptions);
    if (!normalizedOptions.success) {
      const { shouldExit } = handleErrors(normalizedOptions);

      if (shouldExit) {
        process.exit(1);
      }
      return [];
    }

    const plugins: UnpluginOptions[] = [];
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
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
 * Used to expose the webpack bundle analysis unplugin plugin that can be combined with other
 * plugins to create a single plugin for a given meta-framework.
 *
 * @internal
 */
export const _internal_webpackBundleAnalysisPlugin =
  webpackBundleAnalysisPlugin;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to find the filename format for a given compilation.
 *
 * @internal
 */
export const _internal_findFilenameFormat = findFilenameFormat;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to process webpack assets in other plugins.
 *
 * @internal
 */
export const _internal_processAssets = processAssets;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to process webpack chunks in other plugins.
 *
 * @internal
 */
export const _internal_processChunks = processChunks;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to process webpack modules in other plugins.
 *
 * @internal
 */
export const _internal_processModules = processModules;
