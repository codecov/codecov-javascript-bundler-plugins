import { type UnpluginOptions, createVitePlugin } from "unplugin";
import {
  type Options,
  normalizeOptions,
  checkNodeVersion,
  Output,
  handleErrors,
} from "@codecov/bundler-plugin-core";
import { _internal_viteBundleAnalysisPlugin } from "@codecov/vite-plugin";
import { type AstroIntegration } from "astro";
import { type PluginOption } from "vite";

import { astroBundleAnalysisPlugin } from "./astro-bundle-analysis/astroBundleAnalysisPlugin";

// @ts-expect-error - This is a placeholder for the package name.
const PLUGIN_NAME = __PACKAGE_NAME__ as string;

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
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
      plugins.push(
        astroBundleAnalysisPlugin({ output, target }),
        _internal_viteBundleAnalysisPlugin({ output }),
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
        }) as PluginOption[];
        vite.plugins.push(astroPlugin);
      }
    },
  },
});

export default codecovAstroPlugin;
