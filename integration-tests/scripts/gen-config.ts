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
  const outFileExists = await outFile.exists();

  if (outFileExists) {
    await unlink(outFilePath);
  }

  const upperCaseVersion = version.toUpperCase();
  const upperCaseDetectVersion = detectVersion.toUpperCase();

  let contents = await file.text();
  contents = contents.replaceAll(detectFormat, format);
  contents = contents.replaceAll(detectVersion, version);
  contents = contents.replaceAll(upperCaseDetectVersion, upperCaseVersion);

  await Bun.write(outFilePath, contents);
}
