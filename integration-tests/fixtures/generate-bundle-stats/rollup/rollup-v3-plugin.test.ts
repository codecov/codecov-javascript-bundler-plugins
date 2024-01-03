/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import { rollup as rollupV3 } from "rollupV3";
// @ts-expect-error - no types
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

const expectedV3Stats = {
  version: "1",
  plugin: { name: "codecov-rollup-bundle-analysis-plugin", version: "1.0.0" },
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

describe("Generating rollup stats", () => {
  describe("version 3", () => {
    let stats: Output;
    const rollupPath = path.resolve(__dirname, "../../../test-apps/rollup");
    beforeAll(async () => {
      await rollupV3({
        input: `${rollupPath}/src/main.js`,
        plugins: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          resolve(),
          commonjs(),
          codecovRollupPlugin({
            enableBundleAnalysis: true,
            dryRun: true,
            bundleName: "rollup-test",
          }),
        ],
      }).then((bundle) =>
        bundle.write({
          dir: `${rollupPath}/distV3`,
          entryFileNames: "[name]-[hash].js",
        }),
      );

      const statsFilePath = path.resolve(
        rollupPath,
        "distV3/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;
    });

    afterAll(() => {
      fs.rm(
        path.resolve(rollupPath, "distV3"),
        { recursive: true, force: true },
        () => null,
      );
    });

    it("sets the correct version", () => {
      expect(stats.version).toStrictEqual(expectedV3Stats.version);
    });

    it("sets the correct plugin information", () => {
      expect(stats.plugin).toStrictEqual(expectedV3Stats.plugin);
    });

    it("sets the correct bundler information", () => {
      expect(stats.bundler).toStrictEqual(expectedV3Stats.bundler);
    });

    it("sets the correct bundle name", () => {
      expect(stats.bundleName).toStrictEqual("rollup-test-es");
    });
  });
});
