import {
  type BundleAnalysisUploadPlugin,
  red,
} from "@codecov/bundler-plugin-core";
import * as webpack4or5 from "webpack";

const PLUGIN_NAME = "codecov-webpack-bundle-analysis-plugin";

export const webpackBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  userOptions,
}) => ({
  version: "1",
  name: PLUGIN_NAME,
  pluginVersion: "1.0.0",
  webpack(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: webpack4or5.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          // don't need to do anything if the bundle name is not present or empty
          if (!userOptions.bundleName || userOptions.bundleName === "") {
            red("Bundle name is not present or empty. Skipping upload.");
            return;
          }

          if (compilation.name && compilation.name !== "") {
            output.bundleName = `${userOptions.bundleName}-${compilation.name}`;
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
            version: webpack4or5.version,
          };

          const { assets, chunks, modules } = compilationStats;

          if (assets) {
            output.assets = assets.map((asset) => {
              return {
                name: asset.name,
                size: asset.size,
              };
            });
          }

          const chunkIdMap = new Map<number | string, string>();

          if (chunks) {
            let idCounter = 0;
            output.chunks = chunks.map((chunk) => {
              const chunkId = chunk.id ?? "";
              const uniqueId = `${idCounter}-${chunkId}`;
              chunkIdMap.set(chunkId, uniqueId);
              idCounter += 1;

              return {
                id: chunk.id?.toString() ?? "",
                uniqueId: uniqueId,
                entry: chunk.entry,
                initial: chunk.initial,
                files: chunk.files ?? [],
                names: chunk.names ?? [],
              };
            });
          }

          if (modules) {
            output.modules = modules.map((module) => {
              const chunks = module.chunks ?? [];
              const chunkUniqueIds: string[] = [];

              chunks.forEach((chunk) => {
                const chunkUniqueId = chunkIdMap.get(chunk);

                if (chunkUniqueId) {
                  chunkUniqueIds.push(chunkUniqueId);
                }
              });

              return {
                name: module.name ?? "",
                size: module.size ?? 0,
                chunks: module.chunks ?? [],
                chunkUniqueIds: chunkUniqueIds,
              };
            });
          }

          // only output file if running dry run
          if (userOptions?.dryRun) {
            const { RawSource } = webpack4or5.sources;
            compilation.emitAsset(
              "codecov-bundle-stats.json",
              new RawSource(JSON.stringify(output)),
            );
          }
        },
      );
    });
  },
});
