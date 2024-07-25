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

import { solidstartBundleAnalysisPlugin } from "./solidstart-bundle-analysis/solidstartBundleAnalysisPlugin";

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
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
      plugins.push(
        solidstartBundleAnalysisPlugin({ output }),
        _internal_viteBundleAnalysisPlugin({ output }),
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
 * // vite.config.ts
 * import solid from "solid-start/vite";
 * import { defineConfig } from "vite";
 * import { codecovSolidStartPlugin } from "@codecov/solidstart-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     solid(),
 *     // Put the Codecov SolidStart plugin after all other plugins
 *     codecovSolidStartPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-solidstart-bundle",
 *       uploadToken: process.env.CODECOV_TOKEN,
 *     }),
 *   ],
 * });
 * ```
 *
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovSolidStartPlugin: (options: Options) => VitePlugin<any>[] =
  codecovSolidStartPluginFactory;
