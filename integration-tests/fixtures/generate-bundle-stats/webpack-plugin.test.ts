/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import { webpack } from "webpack";
import { codecovWebpackPlugin } from "@codecov/webpack-plugin";

const expectedStats = {
  version: "1",
  plugin: { name: "codecov-webpack-bundle-analysis-plugin", version: "1.0.0" },
  builtAt: 1701788687217,
  duration: 7,
  bundler: { name: "webpack", version: "5.89.0" },
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

describe("Generating webpack stats", () => {
  let stats: Output;
  const webpackPath = path.resolve(__dirname, "../../test-apps/webpack");
  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      webpack(
        {
          cache: false,
          entry: `${webpackPath}/src/main.js`,
          output: {
            path: `${webpackPath}/dist`,
            filename: "main-[hash].js",
          },
          mode: "production",
          plugins: [
            codecovWebpackPlugin({
              enableBundleAnalysis: true,
              dryRun: true,
              bundleName: "webpack-test",
            }),
          ],
        },
        (err) => {
          if (err) {
            throw err;
          }

          resolve();
        },
      );
    });

    const statsFilePath = path.resolve(
      webpackPath,
      "dist/codecov-bundle-stats.json",
    );

    const statsData = fs.readFileSync(statsFilePath);
    stats = JSON.parse(statsData.toString()) as Output;
  });

  afterAll(() => {
    fs.rm(
      path.resolve(webpackPath, "dist"),
      { recursive: true, force: true },
      () => null,
    );
  });

  it("sets the correct version", () => {
    expect(stats.version).toStrictEqual(expectedStats.version);
  });

  it("sets the correct plugin information", () => {
    expect(stats.plugin).toStrictEqual(expectedStats.plugin);
  });

  it("sets the correct bundler information", () => {
    expect(stats.bundler).toStrictEqual(expectedStats.bundler);
  });

  it("sets the correct bundle name", () => {
    expect(stats.bundleName).toStrictEqual("webpack-test-array-push");
  });
});
