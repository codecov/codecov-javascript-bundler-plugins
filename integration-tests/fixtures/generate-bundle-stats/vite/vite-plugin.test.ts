import { $ } from "bun";
import { describe, it, expect } from "bun:test";
import { configV4 } from "./vite-v4-config";
import { configV5 } from "./vite-v5-config";

const vitePath = "node_modules/viteV4/bin/vite.js";
const viteConfig = "fixtures/generate-bundle-stats/vite/vite-v4.config.ts";
const viteApp = "test-apps/vite";

describe("Generating vite stats", () => {
  describe("version 4", () => {
    it("matches the snapshot", async () => {
      const id = 1;
      const config = configV4({
        id,
        status: 200,
      });

      await $`echo ${config} > ${viteConfig}`;
      await $`node ${vitePath} build -c ${viteConfig}`;

      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as unknown;
      // eslint-disable-next-line no-console

      expect(data).toMatchSnapshot();

      await $`rm ${viteConfig}`;
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

      await $`echo ${config} > ${viteConfig}`;
      await $`node ${vitePath} build -c ${viteConfig}`;

      const res = await fetch(`http://localhost:8000/get-stats/${id}`);
      const data = (await res.json()) as unknown;
      // eslint-disable-next-line no-console

      expect(data).toMatchSnapshot();

      await $`rm ${viteConfig}`;
      await $`rm -rf ${viteApp}/distV5`;
    });
  });
});
