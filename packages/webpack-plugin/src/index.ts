import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";
import * as webpack4or5 from "webpack";

const PLUGIN_NAME = "codecov-webpack-bundle-analysis-plugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: ({ output }) => {
    return {
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
              const compilationStats = compilation.getStats().toJson({
                assets: true,
                chunks: true,
                modules: true,
                builtAt: true,
                hash: true,
              });

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

              const { RawSource } = webpack4or5.sources;
              compilation.emitAsset(
                "codecov-bundle-stats.json",
                new RawSource(JSON.stringify(output)),
              );
            },
          );
        });
      },
    };
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovWebpackPlugin: (options: Options) => any =
  codecovUnplugin.webpack;
