/* eslint-disable no-console */
import * as Bun from "bun";
import { unlink } from "node:fs/promises";

type Plugins = "rollup" | "vite" | "webpack" | "nuxt" | "sveltekit" | "remix";

interface CreateConfigOpts {
  plugin: Plugins;
  configFileName: string;
  format: string;
  detectFormat: string;
  version: string;
  detectVersion: string;
  file_format: "ts" | "cjs";
  enableSourceMaps: boolean;
  overrideOutputPath?: string;
}

type BunFile = ReturnType<typeof Bun.file>;

export class GenerateConfig {
  file: BunFile;
  baseConfigPath: string;
  outFile: BunFile;
  outFilePath: string;
  format: string;
  detectFormat: string;
  version: string;
  detectVersion: string;
  enableSourceMaps: boolean;
  newConfigContents?: string;
  plugin: Plugins;

  constructor({
    plugin,
    format,
    detectFormat,
    version,
    detectVersion,
    file_format,
    enableSourceMaps,
    overrideOutputPath,
    configFileName,
  }: CreateConfigOpts) {
    const bundlerDir = `fixtures/generate-bundle-stats/${plugin}`;
    const baseConfigPath = `${bundlerDir}/${configFileName}-base.config.${file_format}`;
    const outFileName = `${configFileName}-${version}-${format}.config.${file_format}`;

    if (overrideOutputPath) {
      this.outFilePath = overrideOutputPath;
    } else {
      this.outFilePath = `${bundlerDir}/${outFileName}`;
    }

    this.file = Bun.file(baseConfigPath);
    this.outFile = Bun.file(this.outFilePath);
    this.format = format;
    this.detectFormat = detectFormat;
    this.version = version;
    this.detectVersion = detectVersion;
    this.enableSourceMaps = enableSourceMaps;
    this.baseConfigPath = baseConfigPath;
    this.plugin = plugin;
  }

  async createConfig() {
    let outFileExists = false;
    try {
      outFileExists = await this.outFile.exists();
    } catch {
      console.error(`Could not check if file exists: ${this.outFilePath}`);
      return;
    }

    if (outFileExists) {
      try {
        await unlink(this.outFilePath);
      } catch {
        console.error(`Could not delete file: ${this.outFilePath}`);
        return;
      }
    }

    const upperCaseVersion = this.version.toUpperCase();
    const upperCaseDetectVersion = this.detectVersion.toUpperCase();

    let baseConfigContents;
    try {
      baseConfigContents = await this.file.text();
    } catch {
      console.error(`Could not read file: ${this.baseConfigPath}`);
      return;
    }

    this.newConfigContents = baseConfigContents
      .replaceAll(this.detectFormat, this.format)
      .replaceAll(this.detectVersion, this.version)
      .replaceAll(upperCaseDetectVersion, upperCaseVersion);

    if (this.enableSourceMaps) {
      if (this.plugin === "webpack") {
        this.newConfigContents = this.newConfigContents.replaceAll(
          "devtool: false",
          "devtool: 'source-map'",
        );
      } else {
        this.newConfigContents = this.newConfigContents.replaceAll(
          "sourcemap: false",
          "sourcemap: true",
        );
      }
    }

    return this.newConfigContents;
  }

  removeBundleName(bundleName: string) {
    if (typeof this.newConfigContents === "string") {
      this.newConfigContents = this.newConfigContents.replaceAll(
        bundleName,
        "",
      );
    }
  }

  async writeConfig() {
    if (typeof this.newConfigContents === "string") {
      await Bun.write(this.outFilePath, this.newConfigContents);
    } else {
      console.error("No new config contents to write");
    }
  }
}
