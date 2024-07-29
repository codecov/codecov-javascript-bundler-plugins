/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const solidStartApp = "test-apps/solidstart";

const VERSIONS = [1];

const FORMATS = [
  { format: "es", expected: "esm" },
  { format: "esm", expected: "esm" },
  { format: "module", expected: "esm" },
];

describe("Generating solidstart stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          // need to re-write config script so that it can point to solidstart dir but still output the vite config file
          // solidstart uses vite under the hood
          plugin: "solidstart",
          configFileName: "app",
          format,
          detectFormat: "esm",
          version: `v1`,
          detectVersion: "v1",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${solidStartApp}/app.config.ts`,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${solidStartApp}/app.config.ts`;
        await $`rm -rf ${solidStartApp}/.solid-start`;
        await $`rm -rf ./fixtures/generate-bundle-stats/solidstart/.solid-start`;
      });

      it(
        "matches the snapshot",
        async () => {
          const id = `solidstart-v${version}-${format}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          await $`cd test-apps/solidstart && API_URL=${API_URL} pnpm run build`;

          const serverBundleName = `test-solidstart-v${version}-server-esm`;
          const clientBundleName = `test-solidstart-v${version}-client-${expected}`;

          // fetch stats from the server
          const clientRes = await fetch(
            `http://localhost:8000/get-stats-by-bundle-name/${id}/${clientBundleName}`,
          );
          const clientData = (await clientRes.json()) as { stats: string };
          const clientStats = JSON.parse(clientData.stats) as unknown;

          expect(clientStats).toMatchSnapshot({
            version: expect.any(String),
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            bundleName: expect.stringContaining(clientBundleName),
            outputPath: expect.any(String),
            bundler: {
              name: expect.any(String),
              version: expect.any(String),
            },
            plugin: {
              name: expect.stringMatching("@codecov/solidstart-plugin"),
              version: expect.any(String),
            },
            assets: expect.arrayContaining([
              {
                name: expect.any(String),
                normalized: expect.any(String),
                size: expect.any(Number),
                gzipSize: expect.any(Number),
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
            version: expect.any(String),
            builtAt: expect.any(Number),
            duration: expect.any(Number),
            outputPath: expect.any(String),
            bundleName: expect.stringContaining(serverBundleName),
            plugin: {
              name: expect.stringMatching("@codecov/solidstart-plugin"),
              version: expect.any(String),
            },
            bundler: {
              name: expect.any(String),
              version: expect.any(String),
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
          plugin: "solidstart",
          configFileName: "app",
          format: "esm",
          detectFormat: "esm",
          version: `v1`,
          detectVersion: "v1",
          file_format: "ts",
          enableSourceMaps: false,
          overrideOutputPath: `${solidStartApp}/app.config.ts`,
        });

        await config.createConfig();
        config.removeBundleName(`test-solidstart-v${version}`);
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${solidStartApp}/app.config.ts`;
        await $`rm -rf ${solidStartApp}/.solid-start`;
        await $`rm -rf ${solidStartApp}/app.config.ts.timestamp-*`;
        await $`rm -rf ./fixtures/generate-bundle-stats/solidstart/.solid-start`;
      });

      it(
        "warns users and exits process with a code 1",
        async () => {
          const id = `solidstart-v${version}-${Date.now()}`;
          const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

          // prepare and build the app
          const { exitCode, stdout } =
            await $`cd test-apps/solidstart && API_URL=${API_URL} pnpm run build`.nothrow();

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
