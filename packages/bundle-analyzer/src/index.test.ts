import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createAndUploadReport } from "./index";
import {
  normalizeOptions,
  Output,
  type Options,
} from "@codecov/bundler-plugin-core";
import {
  normalizeBundleAnalyzerOptions,
  type BundleAnalyzerOptions,
} from "./options";
import { getAssets } from "./assets";
import packageJson from "../package.json";

const EXPECTED_PACKAGE_NAME = packageJson.name;
const EXPECTED_PACKAGE_VERSION = packageJson.version;

vi.mock("@codecov/bundler-plugin-core", async () => {
  const actual = await vi.importActual<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import("@codecov/bundler-plugin-core")
  >("@codecov/bundler-plugin-core");

  return {
    ...actual,
    normalizeOptions: vi.fn().mockImplementation((options: Options) => ({
      success: true,
      options,
    })),
    Output: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      setPlugin: vi.fn(),
      end: vi.fn(),
      write: vi.fn(),
      bundleStatsToJson: vi.fn(),
      assets: [],
      chunks: [],
      modules: [],
    })),
  };
});

vi.mock("./assets", () => ({
  getAssets: vi.fn().mockResolvedValue([
    {
      name: "assets/index-1dca144e.js",
      size: 782,
      gzipSize: 448,
      normalized: "assets/index-*.js",
    },
    {
      name: "index.html",
      size: 386,
      gzipSize: 386,
      normalized: "index.html",
    },
    {
      name: "vite.svg",
      size: 1536,
      gzipSize: 1536,
      normalized: "vite.svg",
    },
  ]),
}));

vi.mock("./options", () => ({
  normalizeBundleAnalyzerOptions: vi
    .fn()
    .mockImplementation((options: Options) => ({
      beforeReportUpload: vi.fn((original: Output) => original),
      ...options,
    })),
}));

describe("createAndUploadReport", () => {
  let coreOptions: Options;
  let bundleAnalyzerOptions: BundleAnalyzerOptions;
  let startHandler: Mock;
  let endHandler: Mock;
  let setPluginHandler: Mock;
  let writeHandler: Mock;
  let bundleStatsToJsonHandler: Mock;
  let beforeReportUpload: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    // initialize handlers
    startHandler = vi.fn();
    endHandler = vi.fn();
    setPluginHandler = vi.fn();
    writeHandler = vi.fn();
    bundleStatsToJsonHandler = vi.fn();

    // initialize options
    coreOptions = {
      dryRun: false,
      uploadToken: "test-token",
      retryCount: 3,
      apiUrl: "https://api.codecov.io",
      bundleName: "my-bundle",
      enableBundleAnalysis: true,
      debug: true,
    };
    beforeReportUpload = vi.fn().mockImplementation((original: Output) => ({
      ...original,
      modified: true,
    }));
    bundleAnalyzerOptions = {
      beforeReportUpload: beforeReportUpload,
      ignorePatterns: ["*.map"],
      normalizeAssetsPattern: "[name]-[hash].js",
      additionalBuildDirectories: ["custom-dir"],
    };

    // update mock implementations for Output with the current handlers
    (Output as Mock).mockImplementation(() => ({
      start: startHandler,
      setPlugin: setPluginHandler,
      end: endHandler,
      write: writeHandler,
      bundleStatsToJson: bundleStatsToJsonHandler,
      assets: [],
      chunks: [],
      modules: [],
    }));
  });

  it("should call all expected handlers for real runs", async () => {
    coreOptions.dryRun = false;

    await createAndUploadReport(
      "/path/to/build/directory",
      coreOptions,
      bundleAnalyzerOptions,
    );

    expect(normalizeOptions).toHaveBeenCalledWith(coreOptions);
    expect(normalizeBundleAnalyzerOptions).toHaveBeenCalledWith(
      bundleAnalyzerOptions,
    );
    expect(getAssets).toHaveBeenCalledWith(
      "/path/to/build/directory",
      bundleAnalyzerOptions.ignorePatterns,
      bundleAnalyzerOptions.normalizeAssetsPattern,
    );
    expect(Output).toHaveBeenCalledTimes(1);
    expect(startHandler).toHaveBeenCalled();
    expect(endHandler).toHaveBeenCalled();
    expect(setPluginHandler).toHaveBeenCalledWith(
      EXPECTED_PACKAGE_NAME,
      EXPECTED_PACKAGE_VERSION,
    );
    expect(writeHandler).toHaveBeenCalled();
  });

  it("should call all expected handlers for dry runs", async () => {
    coreOptions.dryRun = true;

    await createAndUploadReport(
      "/path/to/build/directory",
      coreOptions,
      bundleAnalyzerOptions,
    );

    expect(normalizeOptions).toHaveBeenCalledWith(coreOptions);
    expect(normalizeBundleAnalyzerOptions).toHaveBeenCalledWith(
      bundleAnalyzerOptions,
    );
    expect(getAssets).toHaveBeenCalledWith(
      "/path/to/build/directory",
      bundleAnalyzerOptions.ignorePatterns,
      bundleAnalyzerOptions.normalizeAssetsPattern,
    );
    expect(Output).toHaveBeenCalledTimes(1);
    expect(startHandler).toHaveBeenCalled();
    expect(endHandler).toHaveBeenCalled();
    expect(setPluginHandler).toHaveBeenCalledWith(
      EXPECTED_PACKAGE_NAME,
      EXPECTED_PACKAGE_VERSION,
    );
    expect(writeHandler).not.toHaveBeenCalled(); // dry run shouldn't call write
  });

  it("should handle custom beforeReportUpload", async () => {
    const testFunc = vi.fn();
    beforeReportUpload.mockImplementation((original: Output) => {
      testFunc();
      return {
        ...original,
        modified: true,
      };
    });
    bundleAnalyzerOptions.beforeReportUpload = beforeReportUpload;

    await createAndUploadReport(
      "/path/to/build/directory",
      coreOptions,
      bundleAnalyzerOptions,
    );

    expect(beforeReportUpload).toHaveBeenCalled();
    expect(testFunc).toHaveBeenCalled();
    expect(writeHandler).toHaveBeenCalled();
  });

  it("should throw an error if options normalization fails", async () => {
    (normalizeOptions as Mock).mockReturnValue({
      success: false,
      errors: ["Invalid option"],
    });

    await expect(
      createAndUploadReport("/path/to/build/directory", coreOptions),
    ).rejects.toThrow("Invalid options: Invalid option");
  });
});
