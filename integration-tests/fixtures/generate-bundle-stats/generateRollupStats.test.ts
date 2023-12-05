/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";
import { type Output } from "@codecov/bundler-plugin-core";

const expectedStats = {
  version: "1",
  plugin: { name: "codecov-rollup-bundle-analysis-plugin", version: "1.0.0" },
  builtAt: 1701788687217,
  duration: 7,
  bundler: { name: "rollup", version: "4.6.1" },
  assets: [{ name: "main-Kc6Ge1DG.js", size: 216 }],
  chunks: [
    {
      id: "main",
      uniqueId: "0-main",
      entry: true,
      initial: false,
      files: ["main-Kc6Ge1DG.js"],
      names: ["main"],
    },
  ],
  modules: [
    {
      name: "./src/getRandomNumber.js",
      size: 98,
      chunks: ["main"],
      chunkUniqueIds: ["0-main"],
    },
    {
      name: "./src/main.js",
      size: 115,
      chunks: ["main"],
      chunkUniqueIds: ["0-main"],
    },
  ],
};

describe("Generating rollup stats", () => {
  let stats: Output;
  beforeAll(() => {
    const rollupPath = path.resolve(__dirname, "../../test-apps/rollup");

    spawnSync("pnpm", ["run", "build"], {
      cwd: rollupPath,
    });

    const statsFilePath = path.resolve(
      rollupPath,
      "dist/codecov-bundle-stats.json",
    );

    const statsData = fs.readFileSync(statsFilePath);
    stats = JSON.parse(statsData.toString()) as Output;
  });

  it("sets the correct version", () => {
    expect(stats.version).toStrictEqual(expectedStats.version);
  });

  it("sets the correct plugin information", () => {
    expect(stats.plugin).toStrictEqual(expectedStats.plugin);
  });

  it("sets the correct bundler information", () => {
    expect(stats.bundler).toStrictEqual(expectedStats.bundler);
  });

  it("sets the correct assets information", () => {
    const asset = stats?.assets?.[0];
    expect(asset?.name).toBe(expectedStats?.assets?.[0]?.name);
    expect(asset?.size).toBe(expectedStats?.assets?.[0]?.size);
  });

  it("sets the correct chunks information", () => {
    const chunk = stats?.chunks?.[0];
    expect(chunk?.id).toBe(expectedStats?.chunks?.[0]?.id);
    expect(chunk?.initial).toBe(expectedStats?.chunks?.[0]?.initial);
    expect(chunk?.entry).toBe(expectedStats?.chunks?.[0]?.entry);
    expect(chunk?.names).toStrictEqual(expectedStats?.chunks?.[0]?.names);
    expect(chunk?.files).toStrictEqual(expectedStats?.chunks?.[0]?.files);
  });

  it("sets the correct modules information", () => {
    const module = stats?.modules?.[0];
    expect(module?.name).toBe(expectedStats?.modules?.[0]?.name);
    expect(module?.size).toBe(expectedStats?.modules?.[0]?.size);
    expect(module?.chunks).toStrictEqual(expectedStats?.modules?.[0]?.chunks);
    expect(module?.chunkUniqueIds).toStrictEqual(
      expectedStats?.modules?.[0]?.chunkUniqueIds,
    );
  });
});
