import { $ } from "bun";
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { configV5 } from "./webpack-v5-config-template";

const webpackPath = (version: number) =>
  `node_modules/webpackV${version}/bin/webpack.js`;
const webpackConfig = (version: number) =>
  `fixtures/generate-bundle-stats/webpack/webpack-v${version}.config.cjs`;
const webpackApp = "test-apps/vite";

describe("Generating webpack stats", () => {
  describe("version 5", () => {
    let id: string;
    let config: string;
    let webpack: string;
    let configFile: string;

    beforeEach(async () => {
      id = `webpack-v5-${Date.now()}`;
      config = configV5({
        id,
        status: 200,
      });

      webpack = webpackPath(5);
      configFile = webpackConfig(5);

      await $`echo ${config} > ${configFile}`;
    });

    afterEach(async () => {
      await $`rm ${configFile}`;
      await $`rm -rf ${webpackApp}/dist`;
    });

    it("matches the snapshot", async () => {
      await $`node ${webpack} --config ${configFile}`;

      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      expect(stats).toMatchSnapshot({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        builtAt: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        duration: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        outputPath: expect.stringContaining("/dist"),
      });
    });
  });
});
