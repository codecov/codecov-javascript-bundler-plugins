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
} from "@codecov/bundler-plugin-core";
import { _internal_viteBundleAnalysisPlugin } from "@codecov/vite-plugin";

import { sveltekitBundleAnalysisPlugin } from "./sveltekit-bundle-analysis/sveltekitBundleAnalysisPlugin";

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
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
      plugins.push(
        sveltekitBundleAnalysisPlugin({ output }),
        _internal_viteBundleAnalysisPlugin({ output }),
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
