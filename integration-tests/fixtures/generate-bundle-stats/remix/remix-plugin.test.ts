/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const remixApp = "test-apps/remix";

const VERSIONS = [2];

// Default Rollup formats: https://rollupjs.org/configuration-options/#output-format
const FORMATS = [{ format: "esm", expected: "esm" }];

describe("Generating remix stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          // need to re-write config script so that it can point to remix dir but still output the vite config file
          // remix uses vite under the hood
          plugin: "remix",
          configFileName: "vite",
          format,
          detectFormat: "esm",
          version: `v2`,
          detectVersion: "v2",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${remixApp}/vite.config.ts`,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${remixApp}/vite.config.ts`;
        await $`rm -rf ${remixApp}/.svelte-kit`;
        await $`rm -rf ./fixtures/generate-bundle-stats/remix/build`;
      });

      it(
        "matches the snapshot",
        async () => {
          const id = `remix-v${version}-${format}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          await $`cd test-apps/remix && API_URL=${API_URL} pnpm run build`;

          const serverBundleName = `test-remix-v${version}-server-esm`;
          const clientBundleName = `test-remix-v${version}-client-${expected}`;

          // fetch stats from the server
          const clientRes = await fetch(
            `http://localhost:8000/get-stats-by-bundle-name/${id}/${clientBundleName}`,
          );
          const clientData = (await clientRes.json()) as { stats: string };
          const clientStats = JSON.parse(clientData.stats) as unknown;

          expect(clientStats).toMatchSnapshot({
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            outputPath: expect.stringContaining(`build`),
            bundleName: expect.stringContaining(
              `test-remix-v${version}-client-${expected}`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/remix-plugin"),
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
            outputPath: expect.stringContaining(`build`),
            bundleName: expect.stringContaining(
              `test-remix-v${version}-server-${expected}`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/remix-plugin"),
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
          plugin: "remix",
          configFileName: "vite",
          format: "esm",
          detectFormat: "esm",
          version: `v2`,
          detectVersion: "v2",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${remixApp}/vite.config.ts`,
        });

        await config.createConfig();
        config.removeBundleName(`test-remix-v${version}`);
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${remixApp}/vite.config.ts`;
        await $`rm -rf ${remixApp}/vite.config.ts.timestamp-*`;
        await $`rm -rf ${remixApp}/build`;
        await $`rm -rf ./fixtures/generate-bundle-stats/remix/build`;
      });

      it(
        "warns users and exits process with a code 1",
        async () => {
          const id = `remix-v${version}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          const { exitCode, stdout } =
            await $`cd test-apps/remix && API_URL=${API_URL} pnpm run build`.nothrow();

          expect(exitCode).toBe(1);
          // for some reason this isn't being outputted in the test env
          expect(stdout.toString()).toContain(
            "[codecov] bundleName: `` does not match format: `/^[wd_:/@.{}[]$-]+$/`.",
          );
        },
        { timeout: 25_000 },
      );
    });
  });
});
