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

import { remixBundleAnalysisPlugin } from "./remix-bundle-analysis/remixBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

const codecovRemixVitePluginFactory = createVitePlugin<Options, true>(
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
      metaFramework: "remix",
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
        remixBundleAnalysisPlugin({
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
 * Details for the Codecov Remix plugin.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { vitePlugin as remix } from "@remix-run/dev";
 * import { defineConfig } from "vite";
 * import tsconfigPaths from "vite-tsconfig-paths";
 * import { codecovRemixVitePlugin } from "@codecov/remix-vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     remix(),
 *     tsconfigPaths()
 *     // Put the Codecov SvelteKit plugin after all other plugins
 *     codecovRemixVitePlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-remix-bundle",
 *       gitService: "github",
 *     }),
 *   ],
 * });
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovRemixVitePlugin: (options: Options) => VitePlugin<any>[] =
  codecovRemixVitePluginFactory;
