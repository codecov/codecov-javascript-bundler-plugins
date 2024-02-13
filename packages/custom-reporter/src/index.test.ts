import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createBundleAnalysisReport,
  createAndUploadBundleAnalysisReport,
} from ".";
import fs from "fs";
import path from "path";
import { createAsset } from ".";

// // Mock dependencies
// vi.mock("axios");
// vi.mock("fs");
// vi.mock("bundler-plugin-core");

describe("create BundleAnalysisReport", () => {
  it.only("should", async () => {
    const report = await createBundleAnalysisReport(
      "../__tests__/dotenv-vercel/INPUT",
      {
        apiUrl: "https://api.codecov.io",
        dryRun: false,
        enableBundleAnalysis: true,
        debug: true,
      },
    );
    const asJson = report.bundleStatsToJson();
    console.log(asJson);
  });
});

describe("upload BundleAnalysisReport", () => {
  it("should", async () => {
    createAndUploadBundleAnalysisReport(
      "../__tests__/dotenv-vercel/INPUT",
      "xs",
    );
  });
});

// // Mock dependencies
// vi.mock("fs");
// vi.mock("path");

// describe("createAsset", () => {
//   const mockFilePath = "/path/to/mockFile.js";
//   const mockDirectoryPath = "/path/to";
//   const mockSource = Buffer.from("mock file content");

//   beforeEach(() => {
//     vi.clearAllMocks();

//     vi.spyOn(fs, "existsSync").mockReturnValue(true);

//     vi.spyOn(fs, "statSync").mockReturnValue({
//       isFile: () => true,
//     } as unknown as fs.Stats);

//     vi.spyOn(fs, "readFileSync").mockReturnValue(mockSource);

//     vi.spyOn(path, "relative").mockReturnValue("mockFile.js");
//   });

//   it("should return an asset object with correct properties", async () => {
//     const mockGzipSize = 37;
//     const getCompressedSize = vi.fn().mockResolvedValue(mockGzipSize);

//     const result = await createAsset(mockFilePath, mockDirectoryPath);

//     expect(result).toEqual({
//       name: "mockFile.js",
//       size: mockSource.byteLength,
//       gzipSize: mockGzipSize,
//       normalized: "mockFile.js",
//     });
//   });

//   it("should return null if the file does not exist", async () => {
//     vi.spyOn(fs, "existsSync").mockReturnValue(false);

//     const result = await createAsset(mockFilePath, mockDirectoryPath);

//     expect(result).toBeNull();
//   });

//   it("should return null if the path is a directory", async () => {
//     vi.spyOn(fs, "statSync").mockReturnValue({
//       isFile: () => false,
//     } as unknown as fs.Stats);

//     const result = await createAsset(mockFilePath, mockDirectoryPath);

//     expect(result).toBeNull();
//   });
// });
