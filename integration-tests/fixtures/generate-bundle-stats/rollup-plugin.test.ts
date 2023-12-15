/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { type Output } from "@codecov/bundler-plugin-core";
import { rollup } from "rollup";
// @ts-expect-error - no types
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { codecovRollupPlugin } from "@codecov/rollup-plugin";

const expectedStats = {
  version: "1",
  plugin: { name: "codecov-rollup-bundle-analysis-plugin", version: "1.0.0" },
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

describe("Generating rollup stats", () => {
  let stats: Output;
  const rollupPath = path.resolve(__dirname, "../../test-apps/rollup");

  describe("using dryRun option", () => {
    beforeAll(async () => {
      await rollup({
        input: `${rollupPath}/src/main.js`,
        plugins: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          resolve(),
          commonjs(),
          codecovRollupPlugin({ enableBundleAnalysis: true, dryRun: true }),
        ],
      }).then((bundle) =>
        bundle.write({
          dir: `${rollupPath}/dist`,
          entryFileNames: "[name]-[hash].js",
        }),
      );

      const statsFilePath = path.resolve(
        rollupPath,
        "dist/codecov-bundle-stats.json",
      );

      const statsData = fs.readFileSync(statsFilePath);
      stats = JSON.parse(statsData.toString()) as Output;
    });

    afterAll(() => {
      fs.rm(
        path.resolve(rollupPath, "dist"),
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
  });

  describe("using the test-api", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe("on a successful upload", () => {
      it('logs the message "Successfully pre-signed URL fetched" to the console', async () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

        await rollup({
          input: `${rollupPath}/src/main.js`,
          plugins: [
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            resolve(),
            commonjs(),
            codecovRollupPlugin({
              enableBundleAnalysis: true,
              globalUploadToken: "test-token",
              apiUrl: "http://localhost:8000/test-url/200/true",
              uploaderOverrides: {
                branch: "test-branch",
                build: "test-build",
                pr: "test-pr",
                sha: "test-sha",
                slug: "test-owner/test-repo",
                url: "test-url",
              },
            }),
          ],
        }).then((bundle) =>
          bundle.write({
            dir: `${rollupPath}/dist`,
            entryFileNames: "[name]-[hash].js",
          }),
        );

        expect(consoleLogSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining("Successfully pre-signed URL fetched"),
        );
      });

      it('logs the message "Uploaded bundle stats" to the console', async () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

        await rollup({
          input: `${rollupPath}/src/main.js`,
          plugins: [
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            resolve(),
            commonjs(),
            codecovRollupPlugin({
              enableBundleAnalysis: true,
              globalUploadToken: "test-token",
              apiUrl: "http://localhost:8000/test-url/200/true",
              uploaderOverrides: {
                branch: "test-branch",
                build: "test-build",
                pr: "test-pr",
                sha: "test-sha",
                slug: "test-owner/test-repo",
                url: "test-url",
              },
            }),
          ],
        }).then((bundle) =>
          bundle.write({
            dir: `${rollupPath}/dist`,
            entryFileNames: "[name]-[hash].js",
          }),
        );

        expect(consoleLogSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining("Successfully uploaded stats"),
        );
      });
    });

    describe("user has exceeded upload limit", () => {
      describe("grabbing pre-signed url", () => {
        it('logs the message "Upload limit reached" to the console', async () => {
          const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

          await rollup({
            input: `${rollupPath}/src/main.js`,
            plugins: [
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              resolve(),
              commonjs(),
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                globalUploadToken: "test-token",
                apiUrl: "http://localhost:8000/test-url/429/false",
                uploaderOverrides: {
                  branch: "test-branch",
                  build: "test-build",
                  pr: "test-pr",
                  sha: "test-sha",
                  slug: "test-owner/test-repo",
                  url: "test-url",
                },
              }),
            ],
          }).then((bundle) =>
            bundle.write({
              dir: `${rollupPath}/dist`,
              entryFileNames: "[name]-[hash].js",
            }),
          );

          expect(consoleLogSpy).toHaveBeenCalled();
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Upload limit reached"),
          );
        });
      });

      describe("uploading states information", () => {
        it('logs the message "Upload limit reached" to the console', async () => {
          const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

          await rollup({
            input: `${rollupPath}/src/main.js`,
            plugins: [
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              resolve(),
              commonjs(),
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                globalUploadToken: "test-token",
                apiUrl: "http://localhost:8000/test-url/429/true",
                uploaderOverrides: {
                  branch: "test-branch",
                  build: "test-build",
                  pr: "test-pr",
                  sha: "test-sha",
                  slug: "test-owner/test-repo",
                  url: "test-url",
                },
              }),
            ],
          }).then((bundle) =>
            bundle.write({
              dir: `${rollupPath}/dist`,
              entryFileNames: "[name]-[hash].js",
            }),
          );

          expect(consoleLogSpy).toHaveBeenCalled();
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Upload limit reached"),
          );
        });
      });
    });

    describe("api returns a bad status code", () => {
      describe("grabbing pre-signed url", () => {
        it('logs the message "Failed to upload stats, bad response" to the console', async () => {
          const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

          await rollup({
            input: `${rollupPath}/src/main.js`,
            plugins: [
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              resolve(),
              commonjs(),
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                globalUploadToken: "test-token",
                apiUrl: "http://localhost:8000/test-url/500/false",
                uploaderOverrides: {
                  branch: "test-branch",
                  build: "test-build",
                  pr: "test-pr",
                  sha: "test-sha",
                  slug: "test-owner/test-repo",
                  url: "test-url",
                },
              }),
            ],
          }).then((bundle) =>
            bundle.write({
              dir: `${rollupPath}/dist`,
              entryFileNames: "[name]-[hash].js",
            }),
          );

          expect(consoleLogSpy).toHaveBeenCalled();
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining(
              "Failed to get pre-signed URL, bad response",
            ),
          );
        });
      });

      describe("uploading states information", () => {
        it('logs the message "Failed to upload stats, bad response" to the console', async () => {
          const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

          await rollup({
            input: `${rollupPath}/src/main.js`,
            plugins: [
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              resolve(),
              commonjs(),
              codecovRollupPlugin({
                enableBundleAnalysis: true,
                globalUploadToken: "test-token",
                apiUrl: "http://localhost:8000/test-url/500/true",
                uploaderOverrides: {
                  branch: "test-branch",
                  build: "test-build",
                  pr: "test-pr",
                  sha: "test-sha",
                  slug: "test-owner/test-repo",
                  url: "test-url",
                },
              }),
            ],
          }).then((bundle) =>
            bundle.write({
              dir: `${rollupPath}/dist`,
              entryFileNames: "[name]-[hash].js",
            }),
          );

          expect(consoleLogSpy).toHaveBeenCalled();
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to upload stats, bad response"),
          );
        });
      });
    });
  });
});
