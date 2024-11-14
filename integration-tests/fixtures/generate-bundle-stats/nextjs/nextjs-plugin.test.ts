/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const nextjsApp = "test-apps/nextjs";

const VERSIONS = [15];

describe("Generating nextjs stats", () => {
  describe.each(VERSIONS)("%d", (version) => {
    beforeEach(async () => {
      const config = new GenerateConfig({
        plugin: "nextjs",
        configFileName: "next",
        format: "esm",
        detectFormat: "esm",
        version: `v15`,
        detectVersion: "v15",
        file_format: "mjs",
        enableSourceMaps: false,
        overrideOutputPath: `${nextjsApp}/next.config.mjs`,
      });

      await config.createConfig();
      await config.writeConfig();
    });

    afterEach(async () => {
      await $`rm -rf ${nextjsApp}/next.config.mjs`;
      await $`rm -rf ${nextjsApp}/.next`;
      await $`rm -rf ./fixtures/generate-bundle-stats/nextjs/.next`;
    });

    it(
      "matches the snapshot",
      async () => {
        const id = `nextjs-v${version}-${Date.now()}`;
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // prepare and build the app
        await $`cd test-apps/nextjs && npx --no-install next info && API_URL=${API_URL} pnpm run build`;

        const serverBundleName = `test-nextjs-v${version}-server-cjs`;
        const edgeBundleName = `test-nextjs-v${version}-edge-server-array-push`;
        const clientBundleName = `test-nextjs-v${version}-client-array-push`;

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
            name: expect.stringMatching("@codecov/nextjs-webpack-plugin"),
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
            name: expect.stringMatching("@codecov/nextjs-webpack-plugin"),
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

        // fetch edge stats from the server
        const edgeRes = await fetch(
          `http://localhost:8000/get-stats-by-bundle-name/${id}/${edgeBundleName}`,
        );
        const edgeData = (await edgeRes.json()) as { stats: string };
        const edgeStats = JSON.parse(edgeData.stats) as unknown;

        expect(edgeStats).toMatchSnapshot({
          version: expect.any(String),
          builtAt: expect.any(Number),
          duration: expect.any(Number),
          outputPath: expect.any(String),
          bundleName: expect.stringContaining(edgeBundleName),
          plugin: {
            name: expect.stringMatching("@codecov/nextjs-webpack-plugin"),
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
          chunks: expect.arrayContaining([]),
          modules: expect.arrayContaining([]),
        });
      },
      { timeout: 25_000 },
    );
  });

  describe("invalid bundle name is passed", () => {
    beforeEach(async () => {
      const config = new GenerateConfig({
        plugin: "nextjs",
        configFileName: "next",
        format: "esm",
        detectFormat: "esm",
        version: `v15`,
        detectVersion: "v15",
        file_format: "mjs",
        enableSourceMaps: false,
        overrideOutputPath: `${nextjsApp}/next.config.mjs`,
      });

      await config.createConfig();
      config.removeBundleName(`test-nextjs-v15`);
      await config.writeConfig();
    });

    afterEach(async () => {
      await $`rm -rf ${nextjsApp}/next.config.ts`;
      await $`rm -rf ${nextjsApp}/.next`;
      await $`rm -rf ./fixtures/generate-bundle-stats/nextjs/.next`;
    });

    it(
      "warns users and exits process with a code 1",
      async () => {
        const id = `nextjs-${Date.now()}`;
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // prepare and build the app
        const { exitCode, stdout } =
          await $`cd test-apps/nextjs && API_URL=${API_URL} pnpm run build`.nothrow();

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
