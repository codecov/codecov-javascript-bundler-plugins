import { red, type ExtendedBAUploadPlugin } from "@codecov/bundler-plugin-core";
import type * as webpack from "webpack";

import {
  _internal_processAssets as processAssets,
  _internal_processChunks as processChunks,
  _internal_processModules as processModules,
} from "@codecov/webpack-plugin";

export const nextJSWebpackBundleAnalysisPlugin: ExtendedBAUploadPlugin<{
  webpack: typeof webpack | null;
}> = ({ output, pluginName, pluginVersion }) => ({
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
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      if (!webpack) {
        red(
          "Unable to run bundle analysis, Webpack wasn't passed successfully.",
        );
        return;
      }

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
