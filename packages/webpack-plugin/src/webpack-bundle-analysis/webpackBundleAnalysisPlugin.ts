import path from "node:path";
import {
  red,
  normalizePath,
  type BundleAnalysisUploadPlugin,
  type Asset,
} from "@codecov/bundler-plugin-core";
import * as webpack from "webpack";

import { findFilenameFormat } from "./findFileFormat";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

export const webpackBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
}) => ({
  version: "1",
  name: PLUGIN_NAME,
  pluginVersion: PLUGIN_VERSION,
  buildStart: () => {
    output.start();
    output.setPlugin(PLUGIN_NAME, PLUGIN_VERSION);
  },
  buildEnd: () => {
    output.end();
  },
  writeBundle: async () => {
    await output.write();
  },
  webpack(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: PLUGIN_NAME,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => {
          // TODO - remove this once we hard fail on not having a bundle name
          // don't need to do anything if the bundle name is not present or empty
          if (
            !output.userOptions.bundleName ||
            output.userOptions.bundleName === ""
          ) {
            red("Bundle name is not present or empty. Skipping upload.");
            return;
          }

          output.setBundleName(output.userOptions.bundleName);
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

          const collectedAssets: Asset[] = [];
          if (assets) {
            const filename =
              typeof outputOptions.filename === "string"
                ? outputOptions.filename
                : "";
            const assetModuleFilename =
              typeof outputOptions.assetModuleFilename === "string"
                ? outputOptions.assetModuleFilename
                : "";
            const chunkFilename =
              typeof outputOptions.chunkFilename === "string"
                ? outputOptions.chunkFilename
                : "";
            const cssFilename =
              typeof outputOptions.cssFilename === "string"
                ? outputOptions.cssFilename
                : "";
            const cssChunkFilename =
              typeof outputOptions.chunkFilename === "string"
                ? outputOptions.chunkFilename
                : "";

            for (const asset of assets) {
              const format = findFilenameFormat({
                assetName: asset.name,
                filename,
                assetModuleFilename,
                chunkFilename,
                cssFilename,
                cssChunkFilename,
              });

              if (path.extname(asset.name) === ".map") {
                continue;
              }

              collectedAssets.push({
                name: asset.name,
                size: asset.size,
                normalized: normalizePath(asset.name, format),
              });
            }

            output.assets = collectedAssets;
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
                chunkUniqueIds: chunkUniqueIds,
              };
            });
          }

          output.duration = Date.now() - (output.builtAt ?? 0);
          output.outputPath = outputOptions.path ?? "";

          // only output file if running dry run
          if (output.userOptions.dryRun) {
            const { RawSource } = webpack.sources;
            compilation.emitAsset(
              `${output.bundleName}-stats.json`,
              new RawSource(output.formatPayload()),
            );
          }
        },
      );
    });
  },
});
