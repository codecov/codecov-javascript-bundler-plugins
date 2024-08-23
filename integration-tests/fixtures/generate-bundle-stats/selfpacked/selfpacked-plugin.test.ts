/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { GenerateConfig } from "../../../scripts/gen-config";

const selfpackedPath = (version: number) =>
  `node_modules/selfpackedV${version}/bin/selfpacked.js`;
const selfpackedConfig = (version: number, format: string) =>
  `fixtures/generate-bundle-stats/selfpacked/selfpacked-v${version}-${format}.config.*`;
const selfpackedApp = "test-apps/selfpacked";

const VERSIONS = [0];
// Potential self-packed formats
const FORMATS = [
  { format: "cjs", expected: "cjs" },
  { format: "es", expected: "esm" },
  { format: "esm", expected: "esm" },
  { format: "module", expected: "esm" },
  { format: "system", expected: "system" },
  { format: "systemjs", expected: "system" },
];

describe("Generating self-packed stats", () => {
  describe.each(VERSIONS)("v%d", (version) => {
    describe.each(FORMATS)("%o", ({ format, expected }) => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "selfpacked",
          configFileName: "selfpacked",
          format,
          detectFormat: "esm",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "ts",
          enableSourceMaps: false,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${selfpackedConfig(version, format)}`;
        await $`rm -rf ${selfpackedApp}/distV${version}`;
      });

      it("matches the snapshot", async () => {
        const id = `selfpacked-v${version}-${format}-${Date.now()}`;
        const selfpacked = selfpackedPath(version);
        const configFile = selfpackedConfig(version, format);
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // build the app
        await $`API_URL=${API_URL} node ${selfpacked} build -c ${configFile}`;

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
            `test-selfpacked-v${version}-${expected}`,
          ),
          plugin: {
            name: expect.stringMatching("@codecov/selfpacked-plugin"),
          },
        });
      });
    });

    describe("source maps are enabled", () => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "selfpacked",
          configFileName: "selfpacked",
          format: "esm",
          detectFormat: "esm",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "ts",
          enableSourceMaps: true,
        });

        await config.createConfig();
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${selfpackedConfig(version, "esm")}`;
        await $`rm -rf ${selfpackedApp}/distV${version}`;
      });

      it("does not include any source maps", async () => {
        const id = `selfpacked-v${version}-sourcemaps-${Date.now()}`;
        const selfpacked = selfpackedPath(version);
        const configFile = selfpackedConfig(version, "esm");
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // build the app
        await $`API_URL=${API_URL} node ${selfpacked} build -c ${configFile}`;

        // fetch stats from the server
        const res = await fetch(`http://localhost:8000/get-stats/${id}`);
        const data = (await res.json()) as { stats: string };
        const stats = JSON.parse(data.stats) as unknown;

        // assert the stats
        expect(stats).toMatchSnapshot({
          builtAt: expect.any(Number),
          duration: expect.any(Number),
          outputPath: expect.stringContaining(`/distV${version}`),
          bundleName: expect.not.stringContaining(".map"),
          plugin: {
            name: expect.stringMatching("@codecov/selfpacked-plugin"),
          },
        });
      });
    });

    describe("invalid bundle name is passed", () => {
      beforeEach(async () => {
        const config = new GenerateConfig({
          plugin: "selfpacked",
          configFileName: "selfpacked",
          format: "esm",
          detectFormat: "esm",
          version: `v${version}`,
          detectVersion: "v5",
          file_format: "ts",
          enableSourceMaps: true,
        });

        await config.createConfig();
        config.removeBundleName(`test-selfpacked-v${version}`);
        await config.writeConfig();
      });

      afterEach(async () => {
        await $`rm -rf ${selfpackedConfig(version, "esm")}`;
        await $`rm -rf ${selfpackedApp}/distV${version}`;
      });

      it("warns users and exits process with a code 1", async () => {
        const id = `selfpacked-v${version}-sourcemaps-${Date.now()}`;
        const selfpacked = selfpackedPath(version);
        const configFile = selfpackedConfig(version, "esm");
        const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

        // build the app
        const { exitCode, stdout } =
          await $`API_URL=${API_URL} node ${selfpacked} build -c ${configFile}`.nothrow();

        expect(exitCode).toBe(1);
        expect(stdout.toString()).toContain(
          "[codecov] bundleName: `` does not match format: `/^[wd_:/@.{}[]$-]+$/`.",
        );
      });
    });
  });
});
