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
  createSentryInstance,
  telemetryPlugin,
} from "@codecov/bundler-plugin-core";

import { rollupBundleAnalysisPlugin } from "./rollup-bundle-analysis/rollupBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

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
    const options = normalizedOptions.options;
    const sentryConfig = createSentryInstance({
      telemetry: options.telemetry,
      isDryRun: options.dryRun,
      pluginName: PLUGIN_NAME,
      pluginVersion: PLUGIN_VERSION,
      options,
      bundler: unpluginMetaContext.framework,
    });

    const output = new Output(
      options,
      { metaFramework: unpluginMetaContext.framework },
      sentryConfig,
    );

    if (options.enableBundleAnalysis) {
      plugins.push(
        telemetryPlugin({
          sentryClient: sentryConfig.sentryClient,
          sentryScope: sentryConfig.sentryScope,
          telemetry: options.telemetry,
        }),
        rollupBundleAnalysisPlugin({
          output,
          pluginName: PLUGIN_NAME,
          pluginVersion: PLUGIN_VERSION,
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
