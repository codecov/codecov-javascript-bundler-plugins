import path from "node:path";
import {
  normalizePath,
  type Asset,
  getCompressedSize,
  type MetaFramework,
} from "@codecov/bundler-plugin-core";
import { type StatsAsset, type Compilation } from "@rspack/core";
import { findFilenameFormat } from "./findFileFormat.ts";

export interface ProcessAssetsArgs {
  assets: StatsAsset[];
  compilation: Compilation;
  metaFramework: MetaFramework;
}

export const processAssets = async ({
  assets,
  compilation,
  metaFramework,
}: ProcessAssetsArgs) => {
  const outputOptions = compilation.outputOptions;
  const collectedAssets: Asset[] = [];

  const filename =
    typeof outputOptions.filename === "string" ? outputOptions.filename : "";
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

  await Promise.all(
    assets.map(async (asset) => {
      const format = findFilenameFormat({
        assetName: asset.name,
        filename,
        assetModuleFilename,
        chunkFilename,
        cssFilename,
        cssChunkFilename,
      });

      if (path.extname(asset.name) === ".map") {
        return;
      }

      const currentAsset = compilation.getAsset(asset.name);

      let compressedSize = null;
      if (currentAsset) {
        compressedSize = await getCompressedSize({
          fileName: asset.name,
          code: currentAsset.source.source(),
        });
      }

      collectedAssets.push({
        name: asset.name,
        size: asset.size,
        gzipSize: compressedSize,
        normalized: normalizePath(asset.name, format, metaFramework),
      });
    }),
  );

  return collectedAssets;
};
