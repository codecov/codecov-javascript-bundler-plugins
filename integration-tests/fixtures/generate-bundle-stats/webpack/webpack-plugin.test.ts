/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach } from "bun:test";

const webpackPath = (version: number) =>
  `node_modules/webpackV${version}/bin/webpack.js`;
const webpackConfig = (version: number) =>
  `fixtures/generate-bundle-stats/webpack/webpack-v${version}.config.cjs`;
const webpackApp = "test-apps/vite";

describe("Generating webpack stats", () => {
  describe("version 5", () => {
    afterEach(async () => {
      await $`rm -rf ${webpackApp}/dist`;
    });

    it("matches the snapshot", async () => {
      const id = `webpack-v5-${Date.now()}`;
      const webpack = webpackPath(5);
      const configFile = webpackConfig(5);
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
        outputPath: expect.stringContaining("/dist"),
      });
    });
  });
});
