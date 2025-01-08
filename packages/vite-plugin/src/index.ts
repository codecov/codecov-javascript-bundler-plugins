/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UnpluginOptions,
  createVitePlugin,
  type VitePlugin,
} from "unplugin";
import {
  type Options,
  normalizeOptions,
  checkNodeVersion,
  Output,
  handleErrors,
  createSentryInstance,
  telemetryPlugin,
} from "@codecov/bundler-plugin-core";

import { viteBundleAnalysisPlugin } from "./vite-bundle-analysis/viteBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

const codecovVitePluginFactory = createVitePlugin<Options, true>(
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
    const output = new Output(options, sentryConfig);

    if (options.enableBundleAnalysis) {
      plugins.push(
        telemetryPlugin({
          sentryClient: sentryConfig.sentryClient,
          sentryScope: sentryConfig.sentryScope,
          telemetry: options.telemetry,
        }),
        viteBundleAnalysisPlugin({
          output,
          pluginName: PLUGIN_NAME,
          pluginVersion: PLUGIN_VERSION,
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
 *       gitService: "github",
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
 * Used to expose the vite bundle analysis unplugin plugin that can be combined with other plugins
 * to create a single plugin for a given meta-framework.
 *
 * @internal
 */
export const _internal_viteBundleAnalysisPlugin = viteBundleAnalysisPlugin;
