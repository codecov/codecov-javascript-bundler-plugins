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

    if (!satisfies(process.version, NODE_VERSION_RANGE)) {
      red(
        `Codecov ${unpluginMetaContext.framework} bundler plugin requires Node.js ${NODE_VERSION_RANGE}. You are using Node.js ${process.version}. Please upgrade your Node.js version.`,
      );

      return plugins;
    }

    const { sentryClient } = createSentryInstance(
      options,
      unpluginMetaContext.framework,
    );

    const sentrySession = sentryHub?.startSession();
    sentryHub?.captureSession();

    let sentEndSession = false; // Just to prevent infinite loops with beforeExit, which is called whenever the event loop empties out
    // We also need to manually end sesisons on errors because beforeExit is not called on crashes
    process.on("beforeExit", () => {
      if (!sentEndSession) {
        sentryHub?.endSession();
        sentEndSession = true;
      }
    });

    function handleRecoverableError(unknownError: unknown) {
      if (sentrySession) {
        sentrySession.status = "abnormal";
        try {
          if (options.errorHandler) {
            try {
              if (unknownError instanceof Error) {
                options.errorHandler(unknownError);
              } else {
                options.errorHandler(new Error("An unknown error occurred"));
              }
            } catch (e) {
              sentrySession.status = "crashed";
              throw e;
            }
          } else {
            sentrySession.status = "crashed";
            throw unknownError;
          }
        } finally {
          sentryHub?.endSession();
        }
      }
    }

    if (options?.enableBundleAnalysis) {
      plugins.push(
        bundleAnalysisPluginFactory({
          options,
          unpluginMetaContext,
          bundleAnalysisUploadPlugin,
          sentryClient,
          handleRecoverableError,
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
