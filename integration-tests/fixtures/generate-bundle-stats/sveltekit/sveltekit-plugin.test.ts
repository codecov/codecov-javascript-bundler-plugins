/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const sveltekitApp = "test-apps/sveltekit";

const VERSIONS = [2];

// Default Rollup formats: https://rollupjs.org/configuration-options/#output-format
const FORMATS = [{ format: "esm", expected: "esm" }];

describe("Generating sveltekit stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          // need to re-write config script so that it can point to sveltekit dir but still output the vite config file
          // sveltekit uses vite under the hood
          plugin: "sveltekit",
          configFileName: "vite",
          format,
          detectFormat: "esm",
          version: `v2`,
          detectVersion: "v2",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${sveltekitApp}/vite.config.ts`,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${sveltekitApp}/vite.config.ts`;
        await $`rm -rf ${sveltekitApp}/.svelte-kit`;
        await $`rm -rf ./fixtures/generate-bundle-stats/sveltekit/.svelte-kit`;
      });

      it(
        "matches the snapshot",
        async () => {
          const id = `sveltekit-v${version}-${format}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          await $`cd test-apps/sveltekit && API_URL=${API_URL} pnpm run build`;

          const serverBundleName = `test-sveltekit-v${version}-server-esm`;
          const clientBundleName = `test-sveltekit-v${version}-client-${expected}`;

          // fetch stats from the server
          const clientRes = await fetch(
            `http://localhost:8000/get-stats-by-bundle-name/${id}/${clientBundleName}`,
          );
          const clientData = (await clientRes.json()) as { stats: string };
          const clientStats = JSON.parse(clientData.stats) as unknown;

          expect(clientStats).toMatchSnapshot({
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            outputPath: expect.stringContaining(`.svelte-kit`),
            bundleName: expect.stringContaining(
              `test-sveltekit-v${version}-client-${expected}`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/sveltekit-plugin"),
            },
            assets: expect.arrayContaining([
              {
                name: expect.any(String),
                normalized: expect.any(String),
                size: expect.any(Number),
              },
            ]),
            chunks: expect.arrayContaining([
              {
                id: expect.any(String),
                uniqueId: expect.any(String),
                initial: expect.any(Boolean),
                entry: expect.any(Boolean),
                files: expect.arrayContaining([expect.any(String)]),
                names: expect.arrayContaining([expect.any(String)]),
              },
            ]),
            modules: expect.arrayContaining([
              {
                name: expect.any(String),
                size: expect.any(Number),
                chunkUniqueIds: expect.arrayContaining([expect.any(String)]),
              },
            ]),
          });

          // fetch stats from the server
          const serverRes = await fetch(
            `http://localhost:8000/get-stats-by-bundle-name/${id}/${serverBundleName}`,
          );
          const serverData = (await serverRes.json()) as { stats: string };
          const serverStats = JSON.parse(serverData.stats) as unknown;

          expect(serverStats).toMatchSnapshot({
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            outputPath: expect.stringContaining(`.svelte-kit`),
            bundleName: expect.stringContaining(
              `test-sveltekit-v${version}-server-${expected}`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/sveltekit-plugin"),
            },
            assets: expect.arrayContaining([
              {
                name: expect.any(String),
                normalized: expect.any(String),
                size: expect.any(Number),
              },
            ]),
            chunks: expect.arrayContaining([
              {
                id: expect.any(String),
                uniqueId: expect.any(String),
                initial: expect.any(Boolean),
                entry: expect.any(Boolean),
                files: expect.arrayContaining([expect.any(String)]),
                names: expect.arrayContaining([expect.any(String)]),
              },
            ]),
            modules: expect.arrayContaining([
              {
                name: expect.any(String),
                size: expect.any(Number),
                chunkUniqueIds: expect.arrayContaining([expect.any(String)]),
              },
            ]),
          });
        },
        { timeout: 25_000 },
      );
    });
  });
});
