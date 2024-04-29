/* eslint-disable @typescript-eslint/no-explicit-any */
import { type UnpluginOptions, createVitePlugin } from "unplugin";
import {
  type Options,
  normalizeOptions,
  red,
  checkNodeVersion,
  Output,
} from "@codecov/bundler-plugin-core";
import { _internal_viteBundleAnalysisPlugin } from "@codecov/vite-plugin";
import { addVitePlugin, defineNuxtModule } from "@nuxt/kit";

import { nuxtBundleAnalysisPlugin } from "./nuxt-bundle-analysis/nuxtBundleAnalysisPlugin";
import { type NuxtModule } from "nuxt/schema";

// @ts-expect-error - This is a placeholder for the package name.
const PLUGIN_NAME = __PACKAGE_NAME__ as string;

const codecovNuxtPluginFactory = createVitePlugin<Options, true>(
  (userOptions, unpluginMetaContext) => {
    if (checkNodeVersion(unpluginMetaContext)) {
      return [];
    }

    const normalizedOptions = normalizeOptions(userOptions);
    if (!normalizedOptions.success) {
      for (const error of normalizedOptions.errors) {
        red(error);
      }
      return [];
    }

    const plugins: UnpluginOptions[] = [];
    const output = new Output(normalizedOptions.options);
    const options = normalizedOptions.options;
    if (options.enableBundleAnalysis) {
      plugins.push(
        nuxtBundleAnalysisPlugin({ output }),
        _internal_viteBundleAnalysisPlugin({ output }),
      );
    }

    return plugins;
  },
);

/**
 * Details for the Codecov Nuxt module.
 *
 * @example
 * ```typescript
 * // nuxt.config.ts
 * import { defineNuxtConfig } from "nuxt/config";
 *
 * export default defineNuxtConfig({
 *   devtools: { enabled: true },
 *   w
 *   builder: "vite",
 *   // Ensure that the plugin is added to the modules array
 *   modules: [
 *     [
 *       "@codecov/nuxt-plugin",
 *       {
 *         enableBundleAnalysis: true,
 *         bundleName: "nuxt-bundle-analysis",
 *         uploadToken: process.env.CODECOV_UPLOAD_TOKEN,
 *       },
 *     ],
 *   ],
 * });
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
const codecovNuxtPlugin: NuxtModule<Options> = defineNuxtModule<Options>({
  meta: {
    name: PLUGIN_NAME,
    configKey: "codecovNuxtPlugin",
  },
  setup(options) {
    addVitePlugin(() => codecovNuxtPluginFactory(options));
  },
});

export default codecovNuxtPlugin;
