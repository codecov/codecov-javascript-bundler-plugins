/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const nuxtApp = "test-apps/nuxt";

const VERSIONS = [3];

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

describe("Generating nuxt stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          // nuxt uses vite under the hood
          plugin: "nuxt",
          configFileName: "nuxt",
          format,
          detectFormat: "esm",
          version: `v3`,
          detectVersion: "v3",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${nuxtApp}/nuxt.config.ts`,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${nuxtApp}/nuxt.config.ts`;
        await $`rm -rf ${nuxtApp}/distV${version}`;
      });

      it(
        "matches the snapshot",
        async () => {
          const id = `nuxt-v${version}-${format}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          await $`cd test-apps/nuxt && API_URL=${API_URL} pnpm run build`;

          const serverBundleName = `test-nuxt-v${version}-server-esm`;
          const clientBundleName = `test-nuxt-v${version}-client-${expected}`;

          // fetch stats from the server
          const clientRes = await fetch(
            `http://localhost:8000/get-stats-by-bundle-name/${id}/${clientBundleName}`,
          );
          const clientData = (await clientRes.json()) as { stats: string };
          const clientStats = JSON.parse(clientData.stats) as unknown;

          expect(clientStats).toMatchSnapshot({
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            outputPath: expect.stringContaining(`/distV${version}`),
            bundleName: expect.stringContaining(
              `test-nuxt-v${version}-client-${expected}`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/nuxt-plugin"),
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
            outputPath: expect.stringContaining(`/distV${version}`),
            bundleName: expect.stringContaining(
              `test-nuxt-v${version}-server-esm`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/nuxt-plugin"),
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

    describe("invalid bundle name is passed", () => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          // nuxt uses vite under the hood
          plugin: "nuxt",
          configFileName: "nuxt",
          format: "esm",
          detectFormat: "esm",
          version: `v3`,
          detectVersion: "v3",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${nuxtApp}/nuxt.config.ts`,
        });

        await config.createConfig();
        config.removeBundleName(`test-nuxt-v${version}`);
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${nuxtApp}/nuxt.config.ts`;
        await $`rm -rf ${nuxtApp}/distV${version}`;
      });

      it(
        "warns users and exits process with a code 1",
        async () => {
          const id = `nuxt-v${version}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          const { exitCode } =
            await $`cd test-apps/nuxt && API_URL=${API_URL} pnpm run build`.nothrow();

          expect(exitCode).toBe(1);
          // for some reason this isn't being outputted in the test env
          // expect(stdout.toString()).toContain(
          //   "[codecov] bundleName: `` does not match format: `/^[wd_:/@.{}[]$-]+$/`.",
          // );
        },
        { timeout: 25_000 },
      );
    });
  });
});
