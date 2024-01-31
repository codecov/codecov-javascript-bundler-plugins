/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import { webpack as webpackV5 } from "webpackV5";
import { codecovWebpackPlugin } from "@codecov/webpack-plugin";

describe("Generating webpack stats", () => {
  describe("version 5", () => {
    let stats: Output;
    const webpackPath = path.resolve(__dirname, "../../../test-apps/webpack");
    beforeAll(async () => {
      await new Promise<void>((resolve) => {
        webpackV5(
          {
            cache: false,
            entry: `${webpackPath}/src/main.js`,
            output: {
              path: `${webpackPath}/dist`,
              filename: "main-[contenthash].js",
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
    });

    afterAll(() => {
      fs.rm(
        path.resolve(webpackPath, "dist"),
        { recursive: true, force: true },
        () => null,
      );
    });

    it("matches the snapshot", () => {
      const statsFilePath = path.resolve(
        webpackPath,
        "dist/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;

      expect(stats).toMatchSnapshot({
        builtAt: expect.any(Number),
        duration: expect.any(Number),
        outputPath: expect.stringContaining("/dist"),
      });
    });
  });
});
