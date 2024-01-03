/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import { build as viteV4 } from "viteV4";
import { build as viteV5 } from "viteV5";
import { codecovVitePlugin } from "@codecov/vite-plugin";

const expectedV4Stats = {
  version: "1",
  plugin: { name: "codecov-vite-bundle-analysis-plugin", version: "1.0.0" },
  builtAt: 1701788687217,
  duration: 7,
  bundler: { name: "rollup", version: "3.29.4" },
  assets: [{ name: "main-Kc6Ge1DG.js", size: 216 }],
  chunks: [
    {
      id: "main",
      uniqueId: "0-main",
      entry: true,
      initial: false,
      files: ["main-Kc6Ge1DG.js"],
      names: ["main"],
    },
  ],
  modules: [
    {
      name: "./src/getRandomNumber.js",
      size: 98,
      chunks: ["main"],
      chunkUniqueIds: ["0-main"],
    },
    {
      name: "./src/main.js",
      size: 115,
      chunks: ["main"],
      chunkUniqueIds: ["0-main"],
    },
  ],
};

const expectedV5Stats = {
  version: "1",
  plugin: { name: "codecov-vite-bundle-analysis-plugin", version: "1.0.0" },
  builtAt: 1701788687217,
  duration: 7,
  bundler: { name: "rollup", version: "4.6.0" },
  assets: [{ name: "main-Kc6Ge1DG.js", size: 216 }],
  chunks: [
    {
      id: "main",
      uniqueId: "0-main",
      entry: true,
      initial: false,
      files: ["main-Kc6Ge1DG.js"],
      names: ["main"],
    },
  ],
  modules: [
    {
      name: "./src/getRandomNumber.js",
      size: 98,
      chunks: ["main"],
      chunkUniqueIds: ["0-main"],
    },
    {
      name: "./src/main.js",
      size: 115,
      chunks: ["main"],
      chunkUniqueIds: ["0-main"],
    },
  ],
};

describe("Generating vite stats", () => {
  describe("version 4", () => {
    let stats: Output;
    const vitePath = path.resolve(__dirname, "../../test-apps/vite");
    beforeAll(async () => {
      await viteV4({
        clearScreen: false,
        root: vitePath,
        build: {
          outDir: "dist",
          rollupOptions: {
            input: `${vitePath}/index.html`,
            output: {
              format: "cjs",
            },
          },
        },
        plugins: [
          codecovVitePlugin({
            enableBundleAnalysis: true,
            dryRun: true,
            bundleName: "vite-test",
          }),
        ],
      });

      const statsFilePath = path.resolve(
        vitePath,
        "dist/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;
    });

    afterAll(() => {
      fs.rm(
        path.resolve(vitePath, "dist"),
        { recursive: true, force: true },
        () => null,
      );
    });

    it("sets the correct version", () => {
      expect(stats.version).toStrictEqual(expectedV4Stats.version);
    });

    it("sets the correct plugin information", () => {
      expect(stats.plugin).toStrictEqual(expectedV4Stats.plugin);
    });

    it("sets the correct bundler information", () => {
      expect(stats.bundler).toStrictEqual(expectedV4Stats.bundler);
    });

    it("sets the correct bundle name", () => {
      expect(stats.bundleName).toStrictEqual("vite-test-cjs");
    });
  });

  describe("version 5", () => {
    let stats: Output;
    const vitePath = path.resolve(__dirname, "../../test-apps/vite");
    beforeAll(async () => {
      await viteV5({
        clearScreen: false,
        root: vitePath,
        build: {
          outDir: "dist",
          rollupOptions: {
            input: `${vitePath}/index.html`,
            output: {
              format: "cjs",
            },
          },
        },
        plugins: [
          codecovVitePlugin({
            enableBundleAnalysis: true,
            dryRun: true,
            bundleName: "vite-test",
          }),
        ],
      });

      const statsFilePath = path.resolve(
        vitePath,
        "dist/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;
    });

    afterAll(() => {
      fs.rm(
        path.resolve(vitePath, "dist"),
        { recursive: true, force: true },
        () => null,
      );
    });

    it("sets the correct version", () => {
      expect(stats.version).toStrictEqual(expectedV5Stats.version);
    });

    it("sets the correct plugin information", () => {
      expect(stats.plugin).toStrictEqual(expectedV5Stats.plugin);
    });

    it("sets the correct bundler information", () => {
      expect(stats.bundler).toStrictEqual(expectedV5Stats.bundler);
    });

    it("sets the correct bundle name", () => {
      expect(stats.bundleName).toStrictEqual("vite-test-cjs");
    });
  });
});
