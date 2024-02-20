import { $ } from "bun";
import { describe, it, expect } from "bun:test";
import { configV4 } from "./vite-v4-config-template";
import { configV5 } from "./vite-v5-config-template";

const vitePath = (version: number) =>
  `node_modules/viteV${version}/bin/vite.js`;
const viteConfig = (version: number) =>
  `fixtures/generate-bundle-stats/vite/vite-v${version}.config.ts`;
const viteApp = "test-apps/vite";

describe("Generating vite stats", () => {
  describe("version 4", () => {
    it("matches the snapshot", async () => {
      const id = 1;
      const config = configV4({
        id,
        status: 200,
      });

      const vite = vitePath(4);
      const configFile = viteConfig(4);

      await $`echo ${config} > ${configFile}`;
      await $`node ${vite} build -c ${configFile}`;

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
      await $`rm -rf ${viteApp}/distV4`;
    });
  });

  describe("version 5", () => {
    it("matches the snapshot", async () => {
      const id = 2;
      const config = configV5({
        id,
        status: 200,
      });

      const vite = vitePath(5);
      const configFile = viteConfig(5);

      await $`echo ${config} > ${configFile}`;
      await $`node ${vite} build -c ${configFile}`;

      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as { stats: string };
      const stats = JSON.parse(data.stats) as unknown;

      expect(stats).toMatchSnapshot({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        builtAt: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        duration: expect.any(Number),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        outputPath: expect.stringContaining("/distV5"),
      });

      await $`rm ${configFile}`;
      await $`rm -rf ${viteApp}/distV5`;
    });
  });
});
