import { normalizePath } from "../normalizePath";

describe("normalizePath", () => {
  describe("when the format contains a hash", () => {
    describe("normalizedPath has hash replaced with wildcard", () => {
      it("returns the normalized path", () => {
        const result = normalizePath(
          "test.123.chunk.js",
          "[name].[hash].chunk.js",
        );

        expect(result).toEqual("test.*.chunk.js");
      });
    });

    describe("normalizedPath doe not have hash replaced with wildcard", () => {
      it("returns the normalized path", () => {
        const result = normalizePath(
          "test.12345678.chunk.js",
          "[name]-[hash].chunk.js",
        );

        expect(result).toEqual("test.*.chunk.js");
      });
    });
  });

  describe("when the format does not contain any hash", () => {
    it("returns the passed path", () => {
      const result = normalizePath("test.js", "[name].js");

      expect(result).toEqual("test.js");
    });
  });
});
