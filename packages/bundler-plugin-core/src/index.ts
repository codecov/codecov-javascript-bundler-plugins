import { type UnpluginOptions, createUnplugin } from "unplugin";
import { satisfies } from "semver";
import { z } from "zod";

import {
  type BundleAnalysisUploadPlugin,
  type Asset,
  type Chunk,
  type Module,
  type Options,
  type Output,
} from "./types.ts";

import { jsonSchema } from "./schemas.ts";
import { red } from "./utils/logging.ts";

const NODE_VERSION_RANGE = ">=18.18.0";

interface CodecovUnpluginFactoryOptions {
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
}

export function codecovUnpluginFactory({
  bundleAnalysisUploadPlugin,
}: CodecovUnpluginFactoryOptions) {
  return createUnplugin<Options, true>((userOptions, unpluginMetaContext) => {
    const plugins: UnpluginOptions[] = [];

    if (!satisfies(process.version, NODE_VERSION_RANGE)) {
      red(
        `Codecov ${unpluginMetaContext.framework} bundler plugin requires Node.js ${NODE_VERSION_RANGE}. You are using Node.js ${process.version}. Please upgrade your Node.js version.`,
      );
      process.exit(1);
    }

    if (userOptions?.enableBundleAnalysis) {
      const statsFileName = z
        .string()
        .endsWith(".json")
        .optional()
        .parse(userOptions?.statsFileName);

      const output: Output = {
        version: "1",
      };

      let startTime = NaN;
      const { pluginVersion, version, ...pluginOpts } =
        bundleAnalysisUploadPlugin({
          output,
          statsFileName,
        });

      plugins.push({
        ...pluginOpts,
        buildStart() {
          startTime = Date.now();
          output.version = version;
          output.plugin = {
            name: pluginOpts.name,
            version: pluginVersion,
          };
          output.builtAt = startTime;
        },
        buildEnd(this) {
          const duration = Date.now() - startTime;
          output.duration = duration;
        },
      });
    }

    return plugins;
  });
}

export type { BundleAnalysisUploadPlugin, Asset, Chunk, Module, Options };
export { jsonSchema };
