/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type UnpluginOptions,
  createVitePlugin,
  type VitePlugin,
} from "unplugin";
import {
  type Options,
  normalizeOptions,
  red,
  checkNodeVersion,
  Output,
} from "@codecov/bundler-plugin-core";
import { _internal_vitePlugin } from "@codecov/vite-plugin";

import { nuxtBundleAnalysisPlugin } from "./nuxt-bundle-analysis/nuxtBundleAnalysisPlugin";

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
        _internal_vitePlugin({ output }),
      );
    }

    return plugins;
  },
);

export const codecovNuxtPlugin: (options: Options) => VitePlugin<any>[] =
  codecovNuxtPluginFactory;
