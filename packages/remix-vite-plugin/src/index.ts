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

import { remixBundleAnalysisPlugin } from "./remix-bundle-analysis/remixBundleAnalysisPlugin";

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
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
      plugins.push(
        remixBundleAnalysisPlugin({ output }),
        _internal_viteBundleAnalysisPlugin({ output }),
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
