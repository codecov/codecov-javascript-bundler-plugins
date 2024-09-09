import path from "node:path";
import fs from "node:fs/promises";
import {
  getCompressedSize,
  normalizePath,
  type Asset,
} from "@codecov/bundler-plugin-core";
import { fileURLToPath } from "node:url";

// Resolve __dirname and __filename for both CommonJS and ESModules
let fileName: string;
let __dirname: string;
const isCommonJS =
  typeof module !== "undefined" && module.exports !== undefined;
if (isCommonJS) {
  fileName = __filename;
  __dirname = path.dirname(fileName);
} else {
  // ESModules environment
  fileName = fileURLToPath(import.meta.url);
  __dirname = path.dirname(fileName);
}

/* getAssets gets all Assets to include in a bundle stats report */
export const getAssets = async (
  buildDirectoryPath: string,
): Promise<Asset[]> => {
  const absoluteAssetsDir = path.resolve(__dirname, buildDirectoryPath);
  const files = await listChildFilePaths(absoluteAssetsDir);
  const assets: Asset[] = await Promise.all(
    files.map((file) => getAsset(file, absoluteAssetsDir)),
  );

  return assets;
};

/* getAsset gets an Asset that can be included in a bundle stats report */
export const getAsset = async (
  filePath: string,
  parentPath: string,
): Promise<Asset> => {
  const fileName = path.relative(parentPath, filePath);
  const fileContents = await fs.readFile(filePath);
  const size = fileContents.byteLength;
  const gzipSize = await getCompressedSize({ fileName, code: fileContents });

  // This will replace anything "hashlike" with *. For example index-1dca144e.js --> index-*.js
  const normalizedName = normalizePath(fileName, "");

  return {
    name: fileName,
    size: size,
    gzipSize: gzipSize,
    normalized: normalizedName,
  };
};

/* listChildFilePaths lists the subdirectory file paths within a given directory path */
export const listChildFilePaths = async (
  directoryPath: string,
): Promise<string[]> => {
  const results: string[] = [];
  const list = await fs.readdir(directoryPath, {
    withFileTypes: true,
  });

  for (const file of list) {
    const fullPath = path.join(directoryPath, file.name);

    if (file.isDirectory()) {
      const childPaths = await listChildFilePaths(fullPath);
      childPaths.forEach((file) => results.push(file));
    } else if (file.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
};
