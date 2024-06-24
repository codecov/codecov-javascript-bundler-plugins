import { getCompressedSize } from "../getCompressedSize";
import { describe, it, expect } from "vitest";

describe("getCompressedSize", () => {
  describe("file extension is not compressible", () => {
    it("should return null", async () => {
      const result = await getCompressedSize({
        fileName: "file.png",
        code: "<some cool png data>",
      });

      expect(result).toBe(null);
    });
  });

  describe("file extension is compressible", () => {
    describe("code is a string", () => {
      it("should return the compressed size", async () => {
        const result = await getCompressedSize({
          fileName: "file.css",
          code: "body { color: red; }",
        });

        expect(result).toBe(40);
      });
    });
    describe("code is a Uint8Array", () => {
      it("should return the compressed size", async () => {
        const result = await getCompressedSize({
          fileName: "file.css",
          code: new TextEncoder().encode("body { color: red; }"),
        });

        expect(result).toBe(40);
      });
    });
  });
});
