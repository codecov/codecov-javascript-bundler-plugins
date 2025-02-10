import { type BundleAnalysisUploadPlugin } from "@codecov/bundler-plugin-core";
import { createRequire } from "node:module";
import type * as TWebpack from "webpack";

import { processAssets, processChunks, processModules } from "./utils";

export const webpackBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  pluginName,
  pluginVersion,
}) => ({
  version: output.version,
  name: pluginName,
  pluginVersion,
  buildStart: () => {
    output.start();
    output.setPlugin(pluginName, pluginVersion);
  },
  buildEnd: () => {
    output.end();
  },
  writeBundle: async () => {
    await output.write();
  },
  webpack(compiler) {
    const generatedRequire = createRequire(import.meta.url);
    const webpack = generatedRequire("webpack") as typeof TWebpack;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        async () => {
          output.setBundleName(output.originalBundleName);
          // Webpack base chunk format options: https://webpack.js.org/configuration/output/#outputchunkformat
          if (typeof compilation.outputOptions.chunkFormat === "string") {
            if (compilation.name && compilation.name !== "") {
              output.setBundleName(`${output.bundleName}-${compilation.name}`);
            }

            let chunkFormat = compilation.outputOptions.chunkFormat;
            if (chunkFormat === "commonjs") {
              chunkFormat = "cjs";
            } else if (chunkFormat === "module") {
              chunkFormat = "esm";
            }

            output.setBundleName(`${output.bundleName}-${chunkFormat}`);
          }

          const compilationStats = compilation.getStats().toJson({
            assets: true,
            chunks: true,
            modules: true,
            builtAt: true,
            hash: true,
          });

          output.bundler = {
            name: "webpack",
            version: webpack.version,
          };

          const outputOptions = compilation.outputOptions;
          const { assets, chunks, modules } = compilationStats;

          if (assets) {
            const collectedAssets = await processAssets({
              assets,
              compilation,
              metaFramework: output.metaFramework,
            });

            output.assets = collectedAssets;
          }

          // need to collect all possible chunk ids beforehand
          // this collection is done in the processChunks function
          const chunkIdMap = new Map<number | string, string>();
          if (chunks) {
            output.chunks = processChunks({ chunks, chunkIdMap });
          }

          if (modules) {
            output.modules = processModules({ modules, chunkIdMap });
          }

          output.duration = Date.now() - (output.builtAt ?? 0);
          output.outputPath = outputOptions.path ?? "";

          // only output file if running dry run
          if (output.dryRun) {
            const { RawSource } = webpack.sources;
            compilation.emitAsset(
              `${output.bundleName}-stats.json`,
              new RawSource(output.bundleStatsToJson()),
            );
          }
        },
      );
    });
  },
});
