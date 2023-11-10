import { type UnpluginOptions, createUnplugin } from "unplugin";
import {
  type BundleAnalysisUploadPlugin,
  type Asset,
  type Chunk,
  type Module,
  type Options,
  type Output,
} from "./types.js";

import { jsonSchema } from "./schemas.js";
import { z } from "zod";
interface CodecovUnpluginFactoryOptions {
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
}

export function codecovUnpluginFactory({
  bundleAnalysisUploadPlugin,
}: CodecovUnpluginFactoryOptions) {
  return createUnplugin<Options, true>((userOptions, _unpluginMetaContext) => {
    const plugins: UnpluginOptions[] = [];

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
