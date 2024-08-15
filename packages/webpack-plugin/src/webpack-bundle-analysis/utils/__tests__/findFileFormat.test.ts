import { describe, it, expect } from "vitest";
import { findFilenameFormat } from "../findFileFormat";

describe("findFilenameFormat ", () => {
  describe("when filename matches the format", () => {
    it("returns the filename format", () => {
      const result = findFilenameFormat({
        assetName: "test-123.js",
        filename: "[name]-[hash].js",
        assetModuleFilename: "",
        chunkFilename: "",
        cssFilename: "",
        cssChunkFilename: "",
      });

      expect(result).toEqual("[name]-[hash].js");
    });
  });

  describe("when assetModuleFilename matches the format", () => {
    it("returns the assetModuleFilename format", () => {
      const result = findFilenameFormat({
        assetName: "test-123.js",
        filename: "",
        assetModuleFilename: "[name]-[hash].js",
        chunkFilename: "",
        cssFilename: "",
        cssChunkFilename: "",
      });

      expect(result).toEqual("[name]-[hash].js");
    });
  });

  describe("when chunkFilename matches the format", () => {
    it("returns the chunkFilename format", () => {
      const result = findFilenameFormat({
        assetName: "test-123.js",
        filename: "",
        assetModuleFilename: "",
        chunkFilename: "[name]-[hash].js",
        cssFilename: "",
        cssChunkFilename: "",
      });

      expect(result).toEqual("[name]-[hash].js");
    });
  });

  describe("when cssFilename matches the format", () => {
    it("returns the cssFilename format", () => {
      const result = findFilenameFormat({
        assetName: "test-123.css",
        filename: "",
        assetModuleFilename: "",
        chunkFilename: "",
        cssChunkFilename: "[name]-[hash].css",
        cssFilename: "",
      });

      expect(result).toEqual("[name]-[hash].css");
    });
  });

  describe("when cssChunkFilename matches the format", () => {
    it("returns the cssChunkFilename format", () => {
      const result = findFilenameFormat({
        assetName: "test-123.css",
        filename: "",
        assetModuleFilename: "",
        chunkFilename: "",
        cssFilename: "[name]-[hash].css",
        cssChunkFilename: "",
      });

      expect(result).toEqual("[name]-[hash].css");
    });
  });

  describe("when no format matches", () => {
    it("returns an empty string", () => {
      const result = findFilenameFormat({
        assetName: "test",
        filename: "",
        assetModuleFilename: "",
        chunkFilename: "",
        cssFilename: "",
        cssChunkFilename: "",
      });

      expect(result).toEqual("");
    });
  });
});
