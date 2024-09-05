/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { $ } from "bun";
import { describe, it, expect, afterEach, beforeEach } from "bun:test";

const bundleAnalyzerApp = "test-apps/bundle-analyzer/dotenv-vercel";
const BUILD_DIR = `${bundleAnalyzerApp}/build`;

describe("Bundle Analyzer Integration Tests", () => {
  beforeEach(async () => {
    await $`rm -rf ${BUILD_DIR}`;
    await $`mkdir -p ${BUILD_DIR}`;
  });

  afterEach(async () => {
    await $`rm -rf ${BUILD_DIR}`;
  });

  it("should generate a report and match the snapshot", async () => {
    const id = `bundle-analyzer-${Date.now()}`;
    const API_URL = `http://localhost:8000/test-url/${id}/200/false`;

    // prepare, build, and run
    await $`cd ${bundleAnalyzerApp} && pnpm run build`;
    const { stdout, stderr } =
      await $`cd ${bundleAnalyzerApp} && API_URL=${API_URL} pnpm run analyze`;

    expect(stdout.toString()).toContain(
      "Report successfully generated and uploaded",
    );
    expect(stderr.toString()).not.toContain("Failed to generate");

    // fetch stats from the server
    const res = await fetch(
      `http://localhost:8000/get-stats-by-bundle-name/${id}/bundle-analyzer`,
    );
    const data = (await res.json()) as { stats: string };
    const stats = JSON.parse(data.stats) as unknown;

    // verify the stats match the expected output
    expect(stats).toMatchSnapshot({
      builtAt: expect.any(Number),
      duration: expect.any(Number),
      bundleName: expect.stringContaining("bundle-analyzer"),
      plugin: {
        name: expect.stringMatching("@codecov/bundle-analyzer"),
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
  });
});
