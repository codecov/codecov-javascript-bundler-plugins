/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as webpack from "webpack";
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

import { nextJSWebpackBundleAnalysisPlugin } from "./nextjs-webpack-bundle-analysis/nextJSWebpackBundleAnalysisPlugin.ts";

interface NextPluginOptions extends Options {
  webpack: typeof webpack | null;
}

const codecovNextJSWebpackPluginFactory = createWebpackPlugin<
  NextPluginOptions,
  true
>((userOptions, unpluginMetaContext) => {
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
      nextJSWebpackBundleAnalysisPlugin({
        output,
        options: {
          webpack: userOptions.webpack,
        },
      }),
    );
  }

  return plugins;
});

/**
 * Details for the Codecov NextJS (Webpack) plugin.
 *
 * @example
 * ```typescript
 * // next.config.mjs
 * import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";
 *
 * export default {
 *   webpack: (config, options) => {
 *     config.plugins.push(
 *       codecovNextJSWebpackPlugin({
 *         enableBundleAnalysis: true,
 *         bundleName: "example-nextjs-webpack-bundle",
 *         uploadToken: process.env.CODECOV_TOKEN,
 *         webpack: options.webpack,
 *       }),
 *     );
 *
 *     return config;
 *   },
 * };
 * ```
 *
 * @param options.webpack - pass in the webpack instance from the NextJS configuration.
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovNextJSWebpackPlugin: (
  options: NextPluginOptions,
) => WebpackPluginInstance = codecovNextJSWebpackPluginFactory;
