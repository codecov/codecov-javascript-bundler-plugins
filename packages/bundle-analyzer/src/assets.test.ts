import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { getAssets, getAsset, listChildFilePaths } from "./assets";
import {
  type Asset,
  getCompressedSize,
  normalizePath,
} from "@codecov/bundler-plugin-core";

vi.mock("node:fs/promises");
vi.mock("@codecov/bundler-plugin-core", () => ({
  getCompressedSize: vi.fn(),
  normalizePath: vi.fn(),
}));

describe("getAssets", () => {
  const mockFileContents = Buffer.from("mock file content");
  const mockCompressedSize = 100;
  const mockNormalizedName = "file-*.js";

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.readdir as Mock).mockResolvedValue([]);
    (fs.readFile as Mock).mockResolvedValue(mockFileContents);
    (getCompressedSize as Mock).mockResolvedValue(mockCompressedSize);
    (normalizePath as Mock).mockReturnValue(mockNormalizedName);
  });

  it("should get all assets from the build directory", async () => {
    const mockFiles = [
      { name: "file1.js", isDirectory: () => false, isFile: () => true },
      { name: "file2.css", isDirectory: () => false, isFile: () => true },
    ];

    (fs.readdir as Mock).mockResolvedValueOnce(mockFiles);

    const assets = await getAssets(["path/to/build/directory"], [], "");

    expect(fs.readdir).toHaveBeenCalledTimes(1);
    expect(getCompressedSize).toHaveBeenCalledTimes(mockFiles.length);
    expect(normalizePath).toHaveBeenCalledTimes(mockFiles.length);
    expect(assets).toEqual([
      {
        name: "file1.js",
        size: mockFileContents.byteLength,
        gzipSize: mockCompressedSize,
        normalized: mockNormalizedName,
      },
      {
        name: "file2.css",
        size: mockFileContents.byteLength,
        gzipSize: mockCompressedSize,
        normalized: mockNormalizedName,
      },
    ]);
  });

  it("should ignore files based on the provided ignorePatterns", async () => {
    const mockFiles = [
      { name: "file1.js", isDirectory: () => false, isFile: () => true },
      { name: "file2.css", isDirectory: () => false, isFile: () => true },
    ];

    (fs.readdir as Mock).mockResolvedValueOnce(mockFiles);

    const assets = await getAssets(["path/to/build/directory"], ["*.css"], "");

    expect(fs.readdir).toHaveBeenCalledTimes(1);
    expect(getCompressedSize).toHaveBeenCalledTimes(1); // Only file1.js should be processed
    expect(normalizePath).toHaveBeenCalledTimes(1);
    expect(assets).toEqual([
      {
        name: "file1.js",
        size: mockFileContents.byteLength,
        gzipSize: mockCompressedSize,
        normalized: mockNormalizedName,
      },
    ]);
  });
});

describe("getAsset", () => {
  const mockFilePath = "/path/to/assets/file1.js";
  const mockParentPath = "/path/to/assets";
  const mockFileContents = Buffer.from("mock file content");
  const mockCompressedSize = 100;
  const mockNormalizedName = "file-*.js";

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.readFile as Mock).mockResolvedValue(mockFileContents);
    (getCompressedSize as Mock).mockResolvedValue(mockCompressedSize);
    (normalizePath as Mock).mockReturnValue(mockNormalizedName);
  });

  it("should create an asset for a given file", async () => {
    const asset = await getAsset(mockFilePath, mockParentPath, "");

    expect(fs.readFile).toHaveBeenCalledWith(mockFilePath);
    expect(getCompressedSize).toHaveBeenCalledWith({
      fileName: path.relative(mockParentPath, mockFilePath),
      code: mockFileContents,
    });
    expect(normalizePath).toHaveBeenCalledWith(
      path.relative(mockParentPath, mockFilePath),
      "",
    );
    expect(asset).toEqual({
      name: path.relative(mockParentPath, mockFilePath),
      size: mockFileContents.byteLength,
      gzipSize: mockCompressedSize,
      normalized: mockNormalizedName,
    });
  });

  it("should normalize the asset name based on normalizeAssetsPattern", async () => {
    const inputPattern = "[name]-[hash].js";
    const mockFilePath = "/path/to/assets/something-1dca144e.js";
    const mockParentPath = "/path/to/assets";
    const expectedNormalizedName = "something-*.js";

    (normalizePath as Mock).mockReturnValue(expectedNormalizedName);

    const asset = await getAsset(mockFilePath, mockParentPath, inputPattern);

    expect(normalizePath).toHaveBeenCalledWith(
      path.relative(mockParentPath, mockFilePath),
      inputPattern,
    );

    expect(asset.normalized).toBe(expectedNormalizedName);
  });
});

describe("listChildFilePaths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all files in a directory recursively", async () => {
    const mockFiles = [
      { name: "file1.js", isDirectory: () => false, isFile: () => true },
      { name: "subdir", isDirectory: () => true, isFile: () => false },
    ];
    const mockSubDirFiles = [
      { name: "file2.css", isDirectory: () => false, isFile: () => true },
    ];

    (fs.readdir as Mock).mockResolvedValueOnce(mockFiles);
    (fs.readdir as Mock).mockResolvedValueOnce(mockSubDirFiles);

    const filePaths = await listChildFilePaths("/path/to/directory");

    expect(fs.readdir).toHaveBeenCalledTimes(2);
    expect(filePaths).toEqual([
      path.join("/path/to/directory", "file1.js"),
      path.join("/path/to/directory", "subdir", "file2.css"),
    ]);
  });
});

describe("getAllAssets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (normalizePath as Mock).mockReturnValue("file-*.js");
    (getCompressedSize as Mock).mockResolvedValue(500);
  });

  it("should return assets from multiple build directories", async () => {
    const mockFiles1 = [
      { name: "file1.js", isDirectory: () => false, isFile: () => true },
      { name: "subdir", isDirectory: () => true, isFile: () => false },
    ];
    const mockSubDirFiles1 = [
      { name: "file2.css", isDirectory: () => false, isFile: () => true },
      { name: "file3.js", isDirectory: () => false, isFile: () => true },
    ];

    const mockFiles2 = [
      { name: "fileA.js", isDirectory: () => false, isFile: () => true },
      { name: "subdir", isDirectory: () => true, isFile: () => false },
    ];
    const mockSubDirFiles2 = [
      { name: "fileB.css", isDirectory: () => false, isFile: () => true },
      { name: "fileC.js", isDirectory: () => false, isFile: () => true },
      { name: "fileD.js", isDirectory: () => false, isFile: () => true },
    ];

    (fs.readdir as Mock).mockResolvedValueOnce(mockFiles1);
    (fs.readdir as Mock).mockResolvedValueOnce(mockFiles2);
    (fs.readdir as Mock).mockResolvedValueOnce(mockSubDirFiles1);
    (fs.readdir as Mock).mockResolvedValueOnce(mockSubDirFiles2);

    const assets: Asset[] = await getAssets([
      "path/to/build",
      "path/to/additional/dir",
    ]);

    expect(fs.readdir).toHaveBeenCalledTimes(4);
    expect(getCompressedSize).toHaveBeenCalledTimes(7);
    expect(normalizePath).toHaveBeenCalledTimes(7);
    expect(assets).toEqual([
      {
        name: "file1.js",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
      {
        name: "subdir/file2.css",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
      {
        name: "subdir/file3.js",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
      {
        name: "fileA.js",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
      {
        name: "subdir/fileB.css",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
      {
        name: "subdir/fileC.js",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
      {
        name: "subdir/fileD.js",
        size: Buffer.from("mock file content").byteLength,
        gzipSize: 500,
        normalized: "file-*.js",
      },
    ]);
  });
});
