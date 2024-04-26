/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const vitePath = (version: number) =>
  `node_modules/viteV${version}/bin/vite.js`;
const viteConfig = (version: number, format: string) =>
  `fixtures/generate-bundle-stats/vite/vite-v${version}-${format}.config.ts`;
const viteApp = "test-apps/vite";

const VERSIONS = [4, 5];
// Default Rollup formats: https://rollupjs.org/configuration-options/#output-format
const FORMATS = [
  { format: "amd", expected: "amd" },
  { format: "cjs", expected: "cjs" },
  { format: "es", expected: "esm" },
  { format: "esm", expected: "esm" },
  { format: "module", expected: "esm" },
  { format: "iife", expected: "iife" },
  { format: "umd", expected: "umd" },
  { format: "system", expected: "system" },
  { format: "systemjs", expected: "system" },
];

describe("Generating vite stats", () => {
  describe.each(VERSIONS)("v%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          bundler: "vite",
          format,
          detectFormat: "esm",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "ts",
          enableSourceMaps: false,
        });

        await config.createConfig();
        await config.writeConfig();
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
          bundleName: expect.stringContaining(
            `test-vite-v${version}-${expected}`,
          ),
          plugin: {
            name: expect.stringMatching("@codecov/vite-plugin"),
          },
        });
      });
    });

    describe("source maps are enabled", () => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          bundler: "vite",
          format: "esm",
          detectFormat: "esm",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "ts",
          enableSourceMaps: true,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${viteConfig(version, "esm")}`;
        await $`rm -rf ${viteApp}/distV${version}`;
      });

      it("does not include any source maps", async () => {
        const id = `vite-v${version}-sourcemaps-${Date.now()}`;
        const vite = vitePath(version);
        const configFile = viteConfig(version, "esm");
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
          bundleName: expect.not.stringContaining(".map"),
          plugin: {
            name: expect.stringMatching("@codecov/vite-plugin"),
          },
        });
      });
    });
  });
});
