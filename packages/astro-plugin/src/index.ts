import { type UnpluginOptions, createVitePlugin } from "unplugin";
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
import { type AstroIntegration } from "astro";
import { type PluginOption } from "vite";

import { astroBundleAnalysisPlugin } from "./astro-bundle-analysis/astroBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

interface AstroPluginFactoryOptions extends Options {
  // type can be found from the AstroIntegration type
  target: "client" | "server";
}

const astroPluginFactory = createVitePlugin<AstroPluginFactoryOptions, true>(
  ({ target, ...userOptions }, unpluginMetaContext) => {
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
      metaFramework: "astro",
    });
    const output = new Output(options, sentryConfig);
    if (options.enableBundleAnalysis) {
      plugins.push(
        telemetryPlugin({
          sentryClient: sentryConfig.sentryClient,
          sentryScope: sentryConfig.sentryScope,
          telemetry: options.telemetry,
        }),
        astroBundleAnalysisPlugin({
          output,
          target,
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
 * Details for the Codecov Astro plugin.
 *
 * @example
 * ```typescript
 * // astro.config.mjs
 * import { defineConfig } from "astro/config";
 * import { codecovAstroPlugin } from "@codecov/astro-plugin";
 *
 * // https://astro.build/config
 * export default defineConfig({
 *   // other config settings
 *   integrations: [
 *     // place this after all other integrations
 *     codecovAstroPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-astro-bundle",
 *       gitService: "github",
 *     }),
 *   ],
 * });
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
const codecovAstroPlugin = (options: Options): AstroIntegration => ({
  name: PLUGIN_NAME,
  hooks: {
    // target is type "client" | "server" so instead of determining that on our
    // own we can just utilize this value.
    "astro:build:setup": ({ vite, target }) => {
      if (vite?.plugins) {
        const astroPlugin = astroPluginFactory({
          ...options,
          target,
        }) as PluginOption;
        vite.plugins.push(astroPlugin);
      }
    },
  },
});

export default codecovAstroPlugin;
