import { type UnpluginOptions, createUnplugin } from "unplugin";
import { satisfies } from "semver";

import {
  type BundleAnalysisUploadPlugin,
  type Asset,
  type Chunk,
  type Module,
  type Options,
  type ProviderUtilInputs,
  type UploadOverrides,
  type Output,
} from "./types.ts";
import { red } from "./utils/logging.ts";
import { normalizePath } from "./utils/normalizePath.ts";
import { bundleAnalysisPluginFactory } from "./bundle-analysis/bundleAnalysisPluginFactory.ts";
import { normalizeOptions } from "./utils/normalizeOptions.ts";

const NODE_VERSION_RANGE = ">=18.18.0";

interface CodecovUnpluginFactoryOptions {
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
}

function codecovUnpluginFactory({
  bundleAnalysisUploadPlugin,
}: CodecovUnpluginFactoryOptions) {
  return createUnplugin<Options, true>((userOptions, unpluginMetaContext) => {
    const plugins: UnpluginOptions[] = [];

    const normalizedOptions = normalizeOptions(userOptions);

    if (!normalizedOptions.success) {
      for (const error of normalizedOptions.errors) {
        red(error);
      }
      return [];
    }

    if (!satisfies(process.version, NODE_VERSION_RANGE)) {
      red(
        `Codecov ${unpluginMetaContext.framework} bundler plugin requires Node.js ${NODE_VERSION_RANGE}. You are using Node.js ${process.version}. Please upgrade your Node.js version.`,
      );

      return plugins;
    }

    const options = normalizedOptions.options;
    if (options?.enableBundleAnalysis) {
      plugins.push(
        bundleAnalysisPluginFactory({
          options,
          bundleAnalysisUploadPlugin,
        }),
      );
    }

    return plugins;
  });
}

export type {
  BundleAnalysisUploadPlugin,
  Asset,
  Chunk,
  Module,
  Options,
  ProviderUtilInputs,
  UploadOverrides,
  Output,
};

export { normalizePath, codecovUnpluginFactory, red };
