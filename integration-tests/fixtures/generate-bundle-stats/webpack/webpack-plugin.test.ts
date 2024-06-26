/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const webpackPath = (version: number) =>
  `node_modules/webpackV${version}/bin/webpack.js`;
const webpackConfig = (version: number, format: string) =>
  `fixtures/generate-bundle-stats/webpack/webpack-v${version}-${format}.config.*`;
const webpackApp = "test-apps/webpack";

const VERSIONS = [5];
// Default Webpack formats: https://webpack.js.org/configuration/output/#outputchunkformat
const FORMATS = [
  { format: "array-push", expected: "array-push" },
  { format: "commonjs", expected: "cjs" },
  { format: "module", expected: "esm" },
];

describe("Generating webpack stats", () => {
  describe.each(VERSIONS)(`%d`, (version) => {
    describe.each(FORMATS)(`%o`, ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "webpack",
          configFileName: "webpack",
          format,
          detectFormat: "commonjs",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "cjs",
          enableSourceMaps: false,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${webpackConfig(version, format)}`;
        await $`rm -rf ${webpackApp}/distV${version}`;
      });

      it("matches the snapshot", async () => {
        const id = `webpack-v${version}-${format}-${Date.now()}`;
        const webpack = webpackPath(version);
        const configFile = webpackConfig(version, format);
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // build the app
        await $`API_URL=${API_URL} node ${webpack} --config ${configFile}`;

        // fetch stats from the server
        const res = await fetch(`http://localhost:8000/get-stats/${id}`);
        const data = (await res.json()) as { stats: string };
        const stats = JSON.parse(data.stats) as unknown;

        expect(stats).toMatchSnapshot({
          builtAt: expect.any(Number),
          duration: expect.any(Number),
          outputPath: expect.stringContaining(`/distV${version}`),
          bundleName: expect.stringContaining(
            `test-webpack-v${version}-${expected}`,
          ),
          plugin: {
            name: expect.stringMatching("@codecov/webpack-plugin"),
          },
        });
      });
    });

    describe("source maps are enabled", () => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "webpack",
          configFileName: "webpack",
          format: "module",
          detectFormat: "commonjs",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "cjs",
          enableSourceMaps: false,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${webpackConfig(version, "module")}`;
        await $`rm -rf ${webpackApp}/distV${version}`;
      });

      it("does not include any source maps", async () => {
        const id = `webpack-v${version}-sourcemaps-${Date.now()}`;
        const webpack = webpackPath(version);
        const configFile = webpackConfig(version, "module");
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // build the app
        await $`API_URL=${API_URL} node ${webpack} --config ${configFile}`;

        // fetch stats from the server
        const res = await fetch(`http://localhost:8000/get-stats/${id}`);
        const data = (await res.json()) as { stats: string };
        const stats = JSON.parse(data.stats) as unknown;

        expect(stats).toMatchSnapshot({
          builtAt: expect.any(Number),
          duration: expect.any(Number),
          outputPath: expect.stringContaining(`/distV${version}`),
          bundleName: expect.not.stringContaining(".map"),
          plugin: {
            name: expect.stringMatching("@codecov/webpack-plugin"),
          },
        });
      });
    });

    describe("invalid bundle name is passed", () => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "webpack",
          configFileName: "webpack",
          format: "module",
          detectFormat: "commonjs",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "cjs",
          enableSourceMaps: false,
        });

        await config.createConfig();
        config.removeBundleName(`test-webpack-v${version}`);
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${webpackConfig(version, "module")}`;
        await $`rm -rf ${webpackApp}/distV${version}`;
      });

      it("warns users and exits process with a code 1", async () => {
        const id = `webpack-v${version}-sourcemaps-${Date.now()}`;
        const webpack = webpackPath(version);
        const configFile = webpackConfig(version, "module");
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // build the app
        const { exitCode, stdout } =
          await $`API_URL=${API_URL} node ${webpack} --config ${configFile}`.nothrow();

        expect(exitCode).toBe(1);
        expect(stdout.toString()).toContain(
          "[codecov] bundleName: `` does not match format: `/^[wd_:/@.{}[]$-]+$/`.",
        );
      });
    });
  });
});
