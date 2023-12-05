/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";
import { type Output } from "@codecov/bundler-plugin-core";

const expectedStats = {
  version: "1",
  plugin: { name: "codecov-vite-bundle-analysis-plugin", version: "1.0.0" },
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

describe("Generating vite stats", () => {
  let stats: Output;
  const vitePath = path.resolve(__dirname, "../../test-apps/vite");
  beforeAll(() => {
    spawnSync("pnpm", ["run", "build"], {
      cwd: vitePath,
    });

    const statsFilePath = path.resolve(
      vitePath,
      "dist/codecov-bundle-stats.json",
    );

    const statsData = fs.readFileSync(statsFilePath);
    stats = JSON.parse(statsData.toString()) as Output;
  });

  afterAll(() => {
    fs.rm(
      path.resolve(vitePath, "dist"),
      { recursive: true, force: true },
      () => null,
    );
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
});
