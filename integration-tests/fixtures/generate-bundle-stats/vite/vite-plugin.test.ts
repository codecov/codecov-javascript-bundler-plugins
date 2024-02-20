/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach } from "bun:test";

const vitePath = (version: number) =>
  `node_modules/viteV${version}/bin/vite.js`;
const viteConfig = (version: number) =>
  `fixtures/generate-bundle-stats/vite/vite-v${version}.config.ts`;
const viteApp = "test-apps/vite";

describe("Generating vite stats", () => {
  describe("version 4", () => {
    afterEach(async () => {
      await $`rm -rf ${viteApp}/distV4`;
    });

    it("matches the snapshot", async () => {
      const id = `vite-v4-${Date.now()}`;
      const vite = vitePath(4);
      const configFile = viteConfig(4);
      const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

      // build the app
      await $`API_URL=${API_URL} node ${vite} build -c ${configFile}`;

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

  describe("version 5", () => {
    afterEach(async () => {
      await $`rm -rf ${viteApp}/distV5`;
    });

    it("matches the snapshot", async () => {
      const id = `vite-v5-${Date.now()}`;
      const vite = vitePath(5);
      const configFile = viteConfig(5);
      const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

      // build the app
      await $`API_URL=${API_URL} node ${vite} build -c ${configFile}`;

      // fetch stats from the server
      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      // assert the stats
      expect(stats).toMatchSnapshot({
        builtAt: expect.any(Number),
        duration: expect.any(Number),
        outputPath: expect.stringContaining("/distV5"),
      });
    });
  });
});
