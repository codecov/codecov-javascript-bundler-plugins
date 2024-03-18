/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";

const vitePath = (version: number) =>
  `node_modules/viteV${version}/bin/vite.js`;
const viteConfig = (version: number, format: string) =>
  `fixtures/generate-bundle-stats/vite/vite-v${version}-${format}.config.ts`;
const viteApp = "test-apps/vite";
const genConfigScript = "scripts/gen-config.sh";

const VERSIONS = [4, 5];
const FORMATS = [
  "amd",
  "cjs",
  "es",
  "esm",
  "module",
  "iife",
  "umd",
  "system",
  "systemjs",
];

describe("Generating vite stats", () => {
  describe.each(VERSIONS)("v%d", (version) => {
    describe.each(FORMATS)("%s", (format) => {
      beforeEach(async () => {
        await $`sh ${genConfigScript} vite esm ${format} v4 v${version} ts`;
      });

      afterEach(async () => {
        await $`rm -rf ${viteConfig(version, format)}`;
        await $`rm -rf ${viteApp}/distV${version}`;
      });

      it("matches the snapshot", async () => {
        const id = `vite-v${version}-${format}-${Date.now()}`;
        const vite = vitePath(version);
        const configFile = viteConfig(version, format);
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
          outputPath: expect.stringContaining(`/distV${version}`),
        });
      });
    });
  });
});
