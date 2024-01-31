/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import { rollup as rollupV4 } from "rollupV4";
// @ts-expect-error - no types
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

describe("Generating rollup stats", () => {
  describe("version 4", () => {
    let stats: Output;
    const rollupPath = path.resolve(__dirname, "../../../test-apps/rollup");
    beforeAll(async () => {
      await rollupV4({
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
          dir: `${rollupPath}/distV4`,
          entryFileNames: "[name]-[hash].js",
        }),
      );

      const statsFilePath = path.resolve(
        rollupPath,
        "distV4/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;
    });

    afterAll(() => {
      fs.rm(
        path.resolve(rollupPath, "distV4"),
        { recursive: true, force: true },
        () => null,
      );
    });

    it("matches the snapshot", () => {
      const statsFilePath = path.resolve(
        rollupPath,
        "distV4/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;

      expect(stats).toMatchSnapshot({
        builtAt: expect.any(Number),
        duration: expect.any(Number),
        outputPath: expect.stringContaining("/distV4"),
      });
    });
  });
});
