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
import {
  normalizeOptions,
  type NormalizedOptions,
} from "./utils/normalizeOptions.ts";
import { createSentryInstance } from "./sentry.ts";

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

    const options = normalizedOptions.options;

    const { sentryClient } = createSentryInstance(
      options,
      unpluginMetaContext.framework,
    );

    if (!satisfies(process.version, NODE_VERSION_RANGE)) {
      red(
        `Codecov ${unpluginMetaContext.framework} bundler plugin requires Node.js ${NODE_VERSION_RANGE}. You are using Node.js ${process.version}. Please upgrade your Node.js version.`,
      );

      return plugins;
    }

    if (options?.enableBundleAnalysis) {
      plugins.push(
        bundleAnalysisPluginFactory({
          options,
          unpluginMetaContext,
          bundleAnalysisUploadPlugin,
          sentryClient,
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
  NormalizedOptions,
};

export { normalizePath, codecovUnpluginFactory, red };
