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

import { sveltekitBundleAnalysisPlugin } from "./sveltekit-bundle-analysis/sveltekitBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

const codecovSvelteKitPluginFactory = createVitePlugin<Options, true>(
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
      metaFramework: "sveltekit",
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
        sveltekitBundleAnalysisPlugin({
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
 * Details for the Codecov SvelteKit plugin.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { sveltekit } from "@sveltejs/kit/vite";
 * import { defineConfig } from "vite";
 * import { codecovSvelteKitPlugin } from "@codecov/sveltekit-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     sveltekit(),
 *      // Put the Codecov SvelteKit plugin after all other plugins
 *     codecovSvelteKitPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-sveltekit-bundle",
 *       gitService: "github",
 *     }),
 *   ],
 * });
 *
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovSvelteKitPlugin: (options: Options) => VitePlugin<any>[] =
  codecovSvelteKitPluginFactory;
