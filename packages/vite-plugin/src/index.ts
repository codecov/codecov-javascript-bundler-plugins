/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UnpluginOptions,
  createVitePlugin,
  type VitePlugin,
} from "unplugin";
import {
  type Options,
  normalizeOptions,
  red,
  checkNodeVersion,
} from "@codecov/bundler-plugin-core";

import { viteBundleAnalysisPlugin } from "./vite-bundle-analysis/viteBundleAnalysisPlugin";

const codecovVitePluginFactory = createVitePlugin<Options, true>(
  (userOptions, unpluginMetaContext) => {
    const plugins: UnpluginOptions[] = [];

    const normalizedOptions = normalizeOptions(userOptions);

    if (!normalizedOptions.success) {
      for (const error of normalizedOptions.errors) {
        red(error);
      }
      return [];
    }

    if (checkNodeVersion(unpluginMetaContext)) {
      return [];
    }

    const options = normalizedOptions.options;
    if (options?.enableBundleAnalysis) {
      plugins.push(
        viteBundleAnalysisPlugin({
          output: {
            version: "1",
            bundleName: options.bundleName,
          },
          options,
        }),
      );
    }

    return plugins;
  },
);

/**
 * Details for the Codecov Vite plugin.
 *
 * @example
 * ```typescript
 * // vite.config.js
 * import { defineConfig } from "vite";
 * import { codecovVitePlugin } from "@codecov/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     // Put the Codecov vite plugin after all other plugins
 *     codecovVitePlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-vite-bundle",
 *       uploadToken: process.env.CODECOV_TOKEN,
 *     }),
 *   ],
 * });
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovVitePlugin: (options: Options) => VitePlugin<any>[] =
  codecovVitePluginFactory;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * @access package
 */
export const _internal_vitePlugin = viteBundleAnalysisPlugin;
