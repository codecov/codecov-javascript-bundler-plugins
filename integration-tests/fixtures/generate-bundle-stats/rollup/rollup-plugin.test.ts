/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";

const rollupPath = (version: number) =>
  `node_modules/rollupV${version}/dist/bin/rollup`;
const rollupConfig = (version: number, format: string) =>
  `fixtures/generate-bundle-stats/rollup/rollup-v${version}-${format}.config.cjs`;
const rollupApp = "test-apps/rollup";
const genConfigScript = "scripts/gen-config.sh";

const VERSIONS = [3, 4];
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

describe("Generating rollup stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        await $`sh ${genConfigScript} rollup esm ${format} v3 v${version} cjs`;
      });

      afterEach(async () => {
        await $`rm -rf ${rollupConfig(version, format)}`;
        await $`rm -rf ${rollupApp}/distV${version}`;
      });

      it("matches the snapshot", async () => {
        const id = `rollup-v${version}-${format}-${Date.now()}`;
        const rollup = rollupPath(version);
        const configFile = rollupConfig(version, format);
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
          outputPath: expect.stringContaining(`/distV${version}`),
          bundleName: expect.stringContaining(
            `test-rollup-v${version}-${expected}`,
          ),
        });
      });
    });
  });
});
