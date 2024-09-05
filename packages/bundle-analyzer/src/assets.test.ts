import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type Mock,
  afterEach,
} from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import { getAssets, getAsset, listChildFilePaths } from "./assets";
import { getCompressedSize, normalizePath } from "@codecov/bundler-plugin-core";
import { fileURLToPath } from "url";

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

    const assets = await getAssets("path/to/build/directory");

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
    const asset = await getAsset(mockFilePath, mockParentPath);

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

describe("Module System Compatibility", () => {
  let fileName: string;
  let __dirname: string;

  const setCommonJSContext = () => {
    // @ts-expect-error - ignore ts error for module cleanup
    global.module = { exports: {} };
    fileName = __filename;
    __dirname = path.dirname(fileName);
  };

  const setESModulesContext = () => {
    // @ts-expect-error - ignore ts error for module cleanup
    delete global.module;
    fileName = fileURLToPath(import.meta.url);
    __dirname = path.dirname(fileName);
  };

  afterEach(() => {
    // clean up the global context after each test
    // @ts-expect-error - ignore ts error for module cleanup
    delete global.module;
  });

  it("should correctly set fileName and __dirname in CommonJS environment", () => {
    setCommonJSContext();

    // Assert that fileName and __dirname are correctly set for CommonJS
    expect(fileName).toBe(__filename);
    expect(__dirname).toBe(path.dirname(__filename));
  });

  it("should correctly set fileName and __dirname in ESModules environment", () => {
    setESModulesContext();

    // Assert that fileName and __dirname are correctly set for ESModules
    expect(fileName).toBe(fileURLToPath(import.meta.url));
    expect(__dirname).toBe(path.dirname(fileURLToPath(import.meta.url)));
  });
});
