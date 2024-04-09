import { type UnpluginOptions, createUnplugin } from "unplugin";

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
import { checkNodeVersion } from "./utils/checkNodeVersion.ts";
import { writeBundleFactory } from "./utils/writeBundleFactory.ts";
import { buildStartFactory } from "./utils/buildStartFactory.ts";
import { buildEndFactory } from "./utils/buildEndFactory.ts";

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
  BundleAnalysisUploadPlugin,
  Asset,
  Chunk,
  Module,
  Options,
  ProviderUtilInputs,
  UploadOverrides,
  Output,
};

export {
  normalizePath,
  normalizeOptions,
  bundleAnalysisPluginFactory,
  codecovUnpluginFactory,
  red,
  checkNodeVersion,
  writeBundleFactory,
  buildStartFactory,
  buildEndFactory,
};
