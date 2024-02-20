import { $ } from "bun";
import { describe, it, expect } from "bun:test";
import { configV3 } from "./rollup-v3-config-template";
import { configV4 } from "./rollup-v4-config-template";

const rollupPath = (version: number) =>
  `node_modules/rollupV${version}/dist/bin/rollup`;
const rollupConfig = (version: number) =>
  `fixtures/generate-bundle-stats/rollup/rollup-v${version}.config.cjs`;
const rollupApp = "test-apps/rollup";

describe("Generating rollup stats", () => {
  describe("version 3", () => {
    it("matches the snapshot", async () => {
      const id = 1;
      const config = configV3({
        id,
        status: 200,
      });

      const rollup = rollupPath(3);
      const configFile = rollupConfig(3);

      await $`echo ${config} > ${configFile}`;
      await $`node ${rollup} -c ${configFile}`;

      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      expect(stats).toMatchSnapshot({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        builtAt: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        duration: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        outputPath: expect.stringContaining("/distV3"),
      });

      await $`rm ${configFile}`;
      await $`rm -rf ${rollupApp}/distV3`;
    });
  });

  describe("version 4", () => {
    it("matches the snapshot", async () => {
      const id = 2;
      const config = configV4({
        id,
        status: 200,
      });

      const rollup = rollupPath(4);
      const configFile = rollupConfig(4);

      await $`echo ${config} > ${configFile}`;
      await $`node ${rollup} -c ${configFile}`;

      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      expect(stats).toMatchSnapshot({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        builtAt: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        duration: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        outputPath: expect.stringContaining("/distV4"),
      });

      await $`rm ${configFile}`;
      await $`rm -rf ${rollupApp}/distV4`;
    });
  });
});
