/* eslint-disable no-console */
import * as Bun from "bun";
import { unlink } from "node:fs/promises";

interface CreateConfigOpts {
  bundler: "rollup" | "vite" | "webpack";
  format: string;
  detectFormat: string;
  version: string;
  detectVersion: string;
  file_format: "ts" | "cjs";
}

export async function createConfig({
  bundler,
  format,
  detectFormat,
  version,
  detectVersion,
  file_format,
}: CreateConfigOpts) {
  const bundlerDir = `fixtures/generate-bundle-stats/${bundler}`;
  const baseConfigPath = `${bundlerDir}/${bundler}-base.config.${file_format}`;
  const outFileName = `${bundler}-${version}-${format}.config.${file_format}`;
  const outFilePath = `${bundlerDir}/${outFileName}`;

  const file = Bun.file(baseConfigPath);

  const outFile = Bun.file(outFilePath);
  let outFileExists = false;
  try {
    outFileExists = await outFile.exists();
  } catch {
    console.error(`Could not check if file exists: ${outFilePath}`);
    return;
  }

  if (outFileExists) {
    try {
      await unlink(outFilePath);
    } catch {
      console.error(`Could not delete file: ${outFilePath}`);
      return;
    }
  }

  const upperCaseVersion = version.toUpperCase();
  const upperCaseDetectVersion = detectVersion.toUpperCase();

  let baseConfigContents;
  try {
    baseConfigContents = await file.text();
  } catch {
    console.error(`Could not read file: ${baseConfigPath}`);
    return;
  }

  const newConfigContents = baseConfigContents
    .replaceAll(detectFormat, format)
    .replaceAll(detectVersion, version)
    .replaceAll(upperCaseDetectVersion, upperCaseVersion);

  await Bun.write(outFilePath, newConfigContents);
}
