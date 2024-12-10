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
import { _internal_viteBundleAnalysisPlugin } from "@codecov/vite-plugin";

import { solidstartBundleAnalysisPlugin } from "./solidstart-bundle-analysis/solidstartBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

const codecovSolidStartPluginFactory = createVitePlugin<Options, true>(
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
    const output = new Output(options);
    const sentryConfig = createSentryInstance({
      enableTelemetry: options.telemetry,
      isDryRun: options.dryRun,
      pluginName: PLUGIN_NAME,
      pluginVersion: PLUGIN_VERSION,
      options,
      bundler: unpluginMetaContext.framework,
      metaFramework: "solidstart",
    });

    if (options.enableBundleAnalysis) {
      plugins.push(
        telemetryPlugin({
          sentryClient: sentryConfig.sentryClient,
          sentryScope: sentryConfig.sentryScope,
          shouldSendTelemetry: options.telemetry,
        }),
        solidstartBundleAnalysisPlugin({
          output,
          pluginName: PLUGIN_NAME,
          pluginVersion: PLUGIN_VERSION,
        }),
        _internal_viteBundleAnalysisPlugin({
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
 * Details for the Codecov SolidStart plugin.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * import { defineConfig } from "@solidjs/start/config";
 * import solidPlugin from "vite-plugin-solid";
 * import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";
 *
 * export default defineConfig({
 *   vite: {
 *     plugins: [
 *       // Put the Codecov SolidStart plugin after all other plugins
 *       solidPlugin(),
 *       codecovSolidStartPlugin({
 *         enableBundleAnalysis: true,
 *         bundleName: "example-solidstart-bundle",
 *         gitService: "github",
 *       }),
 *     ],
 *   },
 * });
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovSolidStartPlugin: (options: Options) => VitePlugin<any>[] =
  codecovSolidStartPluginFactory;
