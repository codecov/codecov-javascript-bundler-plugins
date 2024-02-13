import path from "node:path";
import fs from "node:fs";
import { getCompressedSize, type Asset } from "@codecov/bundler-plugin-core";
import { Output, NormalizedOptions } from "@codecov/bundler-plugin-core";

export const createAndUploadBundleAnalysisReport = async (
  directoryPath: string,
  userOptions: NormalizedOptions,
): Promise<void> => {
  try {
    const report = await createBundleAnalysisReport(directoryPath, userOptions);
    await report.write();
    console.log("Report uploaded successfully."); // TODO - what else
  } catch (error) {
    console.error("Failed to upload the report:", error); // TODO - what else
  }
};

export const createBundleAnalysisReport = async (
  assetsDirectoryPath: string,
  userOptions: NormalizedOptions,
): Promise<Output> => {
  const output = new Output(userOptions);
  output.start();
  output.setPlugin("custom", "0.0.0"); // TODO - where to get these

  const absoluteAssetsDir = path.resolve(__dirname, assetsDirectoryPath);
  const files = collectFiles(absoluteAssetsDir);

  const assets: Asset[] = await Promise.all(
    files.map((file) => createAsset(file, absoluteAssetsDir)),
  );

  output.assets = assets;
  output.chunks = []; // TODO - allow specify chunks dir
  output.modules = []; // TODO - allow specify modules dir

  output.end();
  return output;
};

// TODO - what parts to convert to run async / parallel
const collectFiles = (directoryPath: string): string[] => {
  let results: string[] = [];
  const list = fs.readdirSync(directoryPath);

  console.log({ list }); // TODO - remove

  list.forEach((file) => {
    const fullPath = path.join(directoryPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(collectFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });

  return results;
};

export const createAsset = async (
  filePath: string,
  directoryPath: string,
): Promise<Asset | null> => {
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return null;
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    console.error(`Skipping directory: ${filePath}`);
    return null;
  }

  const fileName = path.relative(directoryPath, filePath);
  const source = fs.readFileSync(filePath);

  const size = source.byteLength;
  const gzipSize = await getCompressedSize({ fileName, code: source });

  return {
    name: fileName,
    size: size,
    gzipSize: gzipSize,
    normalized: fileName,
  };
};
