/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import * as viteV5 from "viteV5";
import { codecovVitePlugin } from "@codecov/vite-plugin";

describe("Generating vite stats", () => {
  describe("version 5", () => {
    let stats: Output;
    const vitePath = path.resolve(__dirname, "../../../test-apps/vite");
    beforeAll(async () => {
      await viteV5.build({
        clearScreen: false,
        root: vitePath,
        build: {
          outDir: "distV5",
          rollupOptions: {
            input: `${vitePath}/index.html`,
            output: {
              format: "esm",
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
    });

    afterAll(() => {
      fs.rm(
        path.resolve(vitePath, "distV5"),
        { recursive: true, force: true },
        () => null,
      );
    });

    it("matches the snapshot", () => {
      const statsFilePath = path.resolve(
        vitePath,
        "distV5/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;

      expect(stats).toMatchSnapshot({
        builtAt: expect.any(Number),
        duration: expect.any(Number),
        outputPath: expect.stringContaining("/distV5"),
      });
    });
  });
});
