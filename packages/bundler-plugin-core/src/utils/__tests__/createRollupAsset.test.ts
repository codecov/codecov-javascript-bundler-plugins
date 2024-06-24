import { describe, it, expect } from "vitest";

import { createRollupAsset } from "../createRollupAsset";

describe("createRollupAsset", () => {
  it("sets the asset name", async () => {
    const asset = await createRollupAsset({
      fileName: "test.D4lWaVuy.js",
      source: Buffer.from("test"),
      formatString: "[name].[hash].js",
    });

    expect(asset.name).toBe("test.D4lWaVuy.js");
  });

  it("sets the normalized name", async () => {
    const asset = await createRollupAsset({
      fileName: "test.D4lWaVuy.js",
      source: Buffer.from("test"),
      formatString: "[name].[hash].js",
    });

    expect(asset.normalized).toBe("test.*.js");
  });

  describe("when the source is a Buffer", () => {
    it("sets the size", async () => {
      const asset = await createRollupAsset({
        fileName: "test.D4lWaVuy.js",
        source: Buffer.from("test"),
        formatString: "[name].[hash].js",
      });

      expect(asset.size).toBe(4);
    });

    it("sets the gzip size", async () => {
      const asset = await createRollupAsset({
        fileName: "test.D4lWaVuy.js",
        source: Buffer.from("test"),
        formatString: "[name].[hash].js",
      });
      expect(asset.gzipSize).toBe(24);
    });
  });

  describe("when the source is a string", () => {
    it("sets the size", async () => {
      const asset = await createRollupAsset({
        fileName: "test.D4lWaVuy.js",
        source: "test",
        formatString: "[name].[hash].js",
      });

      expect(asset.size).toBe(4);
    });

    it("sets the gzip size", async () => {
      const asset = await createRollupAsset({
        fileName: "test.D4lWaVuy.js",
        source: "test",
        formatString: "[name].[hash].js",
      });
      expect(asset.gzipSize).toBe(24);
    });
  });
});
