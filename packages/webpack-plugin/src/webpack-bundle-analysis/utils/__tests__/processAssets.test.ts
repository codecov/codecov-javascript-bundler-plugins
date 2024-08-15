import { describe, it, expect, vi } from "vitest";
import { type StatsAsset, type Compilation } from "webpack";

import { processAssets } from "../processAssets";

describe("processAssets", () => {
  describe("there are output options", () => {
    it("should process assets", async () => {
      const assets = [
        {
          name: "file1.js",
          size: 1000,
        },
        {
          name: "file2.js",
          size: 2000,
        },
      ] as StatsAsset[];

      const compilation = {
        hooks: {},
        outputOptions: {
          filename: "filename",
          assetModuleFilename: "assetModuleFilename",
          chunkFilename: "chunkFilename",
          cssFilename: "cssFilename",
          cssChunkFilename: "cssChunkFilename",
        },
        getAsset: vi.fn().mockReturnValue({
          source: {
            source: vi.fn().mockReturnValue("source"),
          },
        }),
        // This is a fairly complex type to mock out, so we're just using the values that are needed for this test
      } as unknown as Compilation;

      const processedAssets = await processAssets({ assets, compilation });

      expect(processedAssets).toEqual([
        {
          name: "file1.js",
          normalized: "file1.js",
          size: 1000,
          gzipSize: 26,
        },
        {
          name: "file2.js",
          normalized: "file2.js",
          size: 2000,
          gzipSize: 26,
        },
      ]);
    });
  });

  describe("there are no output options", () => {
    it("should process assets", async () => {
      const assets = [
        {
          name: "file1.js",
          size: 1000,
        },
        {
          name: "file2.js",
          size: 2000,
        },
      ] as StatsAsset[];

      const compilation = {
        hooks: {},
        outputOptions: {},
        getAsset: vi.fn().mockReturnValue({
          source: {
            source: vi.fn().mockReturnValue("source"),
          },
        }),
        // This is a fairly complex type to mock out, so we're just using the values that are needed for this test
      } as unknown as Compilation;

      const processedAssets = await processAssets({ assets, compilation });

      expect(processedAssets).toEqual([
        {
          name: "file1.js",
          normalized: "file1.js",
          size: 1000,
          gzipSize: 26,
        },
        {
          name: "file2.js",
          normalized: "file2.js",
          size: 2000,
          gzipSize: 26,
        },
      ]);
    });
  });

  describe("when there are source maps", () => {
    it("should not process the asset", async () => {
      const assets = [
        {
          name: "file1.js",
          size: 1000,
        },
        {
          name: "file1.js.map",
          size: 2000,
        },
      ] as StatsAsset[];

      const compilation = {
        hooks: {},
        outputOptions: {
          filename: "filename",
          assetModuleFilename: "assetModuleFilename",
          chunkFilename: "chunkFilename",
          cssFilename: "cssFilename",
          cssChunkFilename: "cssChunkFilename",
        },
        getAsset: vi.fn().mockReturnValue({
          source: {
            source: vi.fn().mockReturnValue("source"),
          },
        }),
        // This is a fairly complex type to mock out, so we're just using the values that are needed for this test
      } as unknown as Compilation;

      const processedAssets = await processAssets({ assets, compilation });

      expect(processedAssets).toEqual([
        {
          name: "file1.js",
          normalized: "file1.js",
          size: 1000,
          gzipSize: 26,
        },
      ]);
    });
  });
});
