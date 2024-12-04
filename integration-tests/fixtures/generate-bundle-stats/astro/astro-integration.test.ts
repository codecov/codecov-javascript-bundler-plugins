/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const astroApp = "test-apps/astro";

const VERSIONS = [4];

const FORMATS = [
  { format: "es", expected: "esm" },
  { format: "esm", expected: "esm" },
  { format: "module", expected: "esm" },
];

describe("Generating astro stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "astro",
          configFileName: "astro",
          format,
          detectFormat: "esm",
          version: `v4`,
          detectVersion: "v4",
          file_format: "mjs",
          enableSourceMaps: false,
          overrideOutputPath: `${astroApp}/astro.config.mjs`,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${astroApp}/astro.config.mjs`;
        await $`rm -rf ${astroApp}/dist`;
        await $`rm -rf ./fixtures/generate-bundle-stats/astro/dist`;
      });

      it(
        "matches the snapshot",
        async () => {
          const id = `astro-v${version}-${format}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          await $`cd test-apps/astro && API_URL=${API_URL} pnpm run build`;

          const serverBundleName = `test-astro-v${version}-server-esm`;
          const clientBundleName = `test-astro-v${version}-client-${expected}`;

          // fetch stats from the server
          const clientRes = await fetch(
            `http://localhost:8000/get-stats-by-bundle-name/${id}/${clientBundleName}`,
          );
          const clientData = (await clientRes.json()) as { stats: string };
          const clientStats = JSON.parse(clientData.stats) as unknown;

          expect(clientStats).toMatchSnapshot({
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            outputPath: expect.stringContaining("dist"),
            bundleName: expect.stringContaining(
              `test-astro-v${version}-client-${expected}`,
            ),
            plugin: {
              name: expect.stringMatching("@codecov/astro-plugin"),
            },
            assets: expect.arrayContaining([
              {
                name: expect.any(String),
                normalized: expect.any(String),
                size: expect.any(Number),
                gzipSize: expect.anything(),
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
                dynamicImports: expect.any(Array),
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
            outputPath: expect.stringContaining("dist"),
            bundleName: expect.stringContaining(serverBundleName),
            plugin: {
              name: expect.stringMatching("@codecov/astro-plugin"),
            },
            assets: expect.arrayContaining([
              {
                name: expect.any(String),
                normalized: expect.any(String),
                size: expect.any(Number),
                gzipSize: expect.anything(),
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
                dynamicImports: expect.any(Array),
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
          plugin: "astro",
          configFileName: "astro",
          format: "esm",
          detectFormat: "esm",
          version: `v4`,
          detectVersion: "v4",
          file_format: "mjs",
          enableSourceMaps: false,
          overrideOutputPath: `${astroApp}/astro.config.mjs`,
        });

        await config.createConfig();
        config.removeBundleName(`test-astro-v${version}`);
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${astroApp}/astro.config.mjs`;
        await $`rm -rf ${astroApp}/dist`;
        await $`rm -rf ./fixtures/generate-bundle-stats/astro/dist`;
      });

      it(
        "warns users and exits process with a code 1",
        async () => {
          const id = `astro-v${version}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          const { exitCode, stdout } =
            await $`cd test-apps/astro && API_URL=${API_URL} pnpm run build`.nothrow();

          expect(exitCode).toBe(1);
          expect(stdout.toString()).toContain(
            "[codecov] bundleName: `` does not match format: `/^[wd_:/@.{}[]$-]+$/`.",
          );
        },
        { timeout: 25_000 },
      );
    });
  });
});
