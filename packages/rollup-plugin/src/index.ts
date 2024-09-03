/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UnpluginOptions,
  createRollupPlugin,
  type RollupPlugin,
} from "unplugin";
import {
  normalizeOptions,
  type Options,
  checkNodeVersion,
  Output,
  handleErrors,
} from "@codecov/bundler-plugin-core";

import { rollupBundleAnalysisPlugin } from "./rollup-bundle-analysis/rollupBundleAnalysisPlugin";

const codecovRollupPluginFactory = createRollupPlugin<Options, true>(
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
        rollupBundleAnalysisPlugin({
          output,
        }),
      );
    }

    return plugins;
  },
);

// eslint-disable-next-line isaacscript/complete-sentences-jsdoc
/**
 * Details for the Codecov Rollup plugin.
 *
 * @param {Options} options - See {@link @codecov/bundler-plugin-core!Options | Options} for more
 *        details.
 *
 * @example
 * ```typescript
 * // rollup.config.js
 * import { defineConfig } from "rollup";
 * import { codecovRollupPlugin } from "@codecov/rollup-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     // Put the Codecov rollup plugin after all other plugins
 *     codecovRollupPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-rollup-bundle",
 *       gitService: "github",
 *     }),
 *   ],
 * });
 * ```
 */
export const codecovRollupPlugin: (options: Options) => RollupPlugin<any>[] =
  codecovRollupPluginFactory;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to expose the rollup bundle analysis unplugin plugin that can be combined with other plugins
 * to create a single plugin for a given meta-framework.
 *
 * @internal
 */
export const _internal_rollupBundleAnalysisPlugin = rollupBundleAnalysisPlugin;
