import { createUnplugin, type UnpluginOptions } from "unplugin";

import { bundleAnalysisPluginFactory } from "./bundle-analysis/bundleAnalysisPluginFactory.ts";
import {
  type Asset,
  type BundleAnalysisUploadPlugin,
  type Chunk,
  type Module,
  type Options,
  type Output,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "./types.ts";
import { buildEndHelper } from "./utils/buildEndHelper.ts";
import { buildStartHelper } from "./utils/buildStartHelper.ts";
import { checkNodeVersion } from "./utils/checkNodeVersion.ts";
import { red } from "./utils/logging.ts";
import { normalizeOptions } from "./utils/normalizeOptions.ts";
import { normalizePath } from "./utils/normalizePath.ts";
import { writeBundleHelper } from "./utils/writeBundleHelper.ts";

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

    if (checkNodeVersion(unpluginMetaContext)) {
      return [];
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
  Asset,
  BundleAnalysisUploadPlugin,
  Chunk,
  Module,
  Options,
  Output,
  ProviderUtilInputs,
  UploadOverrides,
};

export {
  buildEndHelper,
  buildStartHelper,
  bundleAnalysisPluginFactory,
  checkNodeVersion,
  codecovUnpluginFactory,
  normalizeOptions,
  normalizePath,
  red,
  writeBundleHelper,
};
