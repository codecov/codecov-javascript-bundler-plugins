/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";

const webpackPath = (version: number) =>
  `node_modules/webpackV${version}/bin/webpack.js`;
const webpackConfig = (version: number, format: string) =>
  `fixtures/generate-bundle-stats/webpack/webpack-v${version}-${format}.config.cjs`;
const webpackApp = "test-apps/webpack";
const genConfigScript = "scripts/gen-config.sh";

const VERSIONS = [5];
const FORMATS = ["array-push", "commonjs", "module"];

describe("Generating webpack stats", () => {
  describe.each(VERSIONS)(`%d`, (version) => {
    describe.each(FORMATS)(`%s`, (format) => {
      beforeEach(async () => {
        await $`sh ${genConfigScript} webpack commonjs ${format} v5 v${version} cjs`;
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
        });
      });
    });
  });
});
