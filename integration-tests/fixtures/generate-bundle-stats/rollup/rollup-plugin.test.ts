/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach } from "bun:test";

const rollupPath = (version: number) =>
  `node_modules/rollupV${version}/dist/bin/rollup`;
const rollupConfig = (version: number) =>
  `fixtures/generate-bundle-stats/rollup/rollup-v${version}.config.cjs`;
const rollupApp = "test-apps/rollup";

describe("Generating rollup stats", () => {
  describe("version 3", () => {
    afterEach(async () => {
      await $`rm -rf ${rollupApp}/distV3`;
    });

    it("matches the snapshot", async () => {
      const id = `rollup-v3-${Date.now()}`;
      const rollup = rollupPath(3);
      const configFile = rollupConfig(3);
      const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

      // build the app
      await $`API_URL=${API_URL} node ${rollup} -c ${configFile}`;

      // fetch stats from the server
      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      // assert the stats
      expect(stats).toMatchSnapshot({
        builtAt: expect.any(Number),
        duration: expect.any(Number),
        outputPath: expect.stringContaining("/distV3"),
      });
    });
  });

  describe("version 4", () => {
    afterEach(async () => {
      await $`rm -rf ${rollupApp}/distV4`;
    });

    it("matches the snapshot", async () => {
      const id = `rollup-v4-${Date.now()}`;
      const rollup = rollupPath(4);
      const configFile = rollupConfig(4);
      const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

      // build the app
      await $`API_URL=${API_URL} node ${rollup} -c ${configFile}`;

      // fetch stats from the server
      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      // assert the stats
      expect(stats).toMatchSnapshot({
        builtAt: expect.any(Number),
        duration: expect.any(Number),
        outputPath: expect.stringContaining("/distV4"),
      });
    });
  });
});
