import {
  type Options,
  normalizeOptions,
  checkNodeVersion,
  Output,
  handleErrors,
} from "@codecov/bundler-plugin-core";

import { selfpackedBundleAnalysisPlugin as selfpackedBundleAnalysisPlugin } from "./selfpacked-bundle-analysis/selfpackedBundleAnalysisPlugin";

const codecovSelfpackedPluginFactory = createSelfpackedPlugin<Options, true>(
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
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
      const output = new Output(normalizedOptions.options);
      plugins.push(selfpackedBundleAnalysisPlugin({ output }));
    }

    return plugins;
  },
);

/**
 * Details for the Codecov Self-packed plugin.
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
export const codecovSelfpackedPlugin: (options: Options) => SelfpackedPlugin<any>[] =
  codecovSelfpackedPluginFactory;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to expose the bundle analysis plugin that can be combined with other plugins
 * to create a single plugin for a given meta-framework.
 *
 * @internal
 */
export const _internal_selfpackedBundleAnalysisPlugin = selfpackedBundleAnalysisPlugin;
