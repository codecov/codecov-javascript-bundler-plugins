import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  beforeEach,
} from "vitest";
import { execSync, execFileSync } from "node:child_process";
import path from "node:path";
import * as url from "node:url";
import fs from "node:fs";
import {
  prepareBundleAnalyzerOptions,
  prepareCoreOptions,
  runCli,
} from "./cli";
import { createAndUploadReport } from "src";

export const runCLI = (args: string[]): string | undefined => {
  const cliPath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    "../src/cli.ts",
  );

  try {
    const cmd = "npx";
    const allArgs = ["tsx", cliPath, ...args];

    return execFileSync(cmd, allArgs, { encoding: "utf-8" });
  } catch (error) {
    if (error instanceof Error) {
      return JSON.stringify(error);
    }
    return "An unknown error occurred.";
  }
};

describe("CLI script", () => {
  beforeAll(() => {
    // Ensure the build completes before tests
    execSync("pnpm run build", { stdio: "inherit" });

    // Verify that the build directory exists
    const thisBuildPath = path.resolve(
      path.dirname(url.fileURLToPath(import.meta.url)),
      "../dist",
    );

    if (!fs.existsSync(thisBuildPath)) {
      throw new Error(
        "Build directory does not exist. Ensure build completes successfully.",
      );
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should exit with an error if build directory paths are missing", () => {
    const output = runCLI([]);
    expect(output).toContain(
      "Not enough non-option arguments: got 0, need at least 1",
    );
  });

  it("should exit with success if upload token is in an env var", () => {
    const originalToken = process.env.CODECOV_UPLOAD_TOKEN;
    process.env.CODECOV_UPLOAD_TOKEN = "token123";

    const output = runCLI([
      "./src",
      "../bundle-analyzer",
      "--bundle-name=someName",
      "--dry-run",
      "--ignore-patterns=*.map",
      "--normalize-assets-pattern=[name]-[hash].js",
    ]);

    process.env.CODECOV_UPLOAD_TOKEN = originalToken;

    expect(output).toContain(
      `"bundleName":"someName","plugin":{"name":"@codecov/bundle-analyzer"`,
    );
  });

  it("should exit with success when valid inputs are provided", () => {
    const output = runCLI([
      "./src",
      "../bundle-analyzer",
      "--bundle-name=someName",
      "--upload-token=token123",
      "--dry-run",
      "--ignore-patterns=*.map",
      "--normalize-assets-pattern=[name]-[hash].js",
    ]);

    expect(output).toContain(
      `"bundleName":"someName","plugin":{"name":"@codecov/bundle-analyzer"`,
    );
  });

  it("should log an error message if the directory doesn't exist", () => {
    const output = runCLI([
      "./doesnt-exist",
      "--bundle-name=someName",
      "--upload-token=token123",
    ]);

    expect(output).toContain("An error occurred:");
  });

  it("should handle multiple ignore patterns correctly", () => {
    const output = runCLI([
      "./src",
      "../bundle-analyzer",
      "--bundle-name=someName",
      "--upload-token=token123",
      "--dry-run",
      "--ignore-patterns=*.map",
      "--ignore-patterns=*.test.js",
      "--normalize-assets-pattern=[name]-[hash].js",
    ]);

    expect(output).toContain(
      `"bundleName":"someName","plugin":{"name":"@codecov/bundle-analyzer"`,
    );
    expect(output).not.toContain(".map");
    expect(output).not.toContain(".test.js");
  });
});

// describe("CLI tests", () => {
//   const originalArgv = process.argv;

//   beforeEach(() => {
//     vi.spyOn(process, "exit").mockImplementation((code) => {
//       throw new Error(`process.exit called with code: ${code}`);
//     });

//     // Mock process.argv for every test
//     process.argv = [...originalArgv];
//   });

//   afterEach(() => {
//     // Restore the original argv and process.exit after each test
//     process.argv = originalArgv;
//     vi.restoreAllMocks();
//   });

//   it("should prepare core options correctly", () => {
//     const argv = {
//       apiUrl: "https://custom-api.io",
//       dryRun: true,
//       uploadToken: "fake-token",
//       bundleName: "test-bundle",
//       debug: true,
//     };

//     const expectedCoreOptions = {
//       apiUrl: "https://custom-api.io",
//       dryRun: true,
//       uploadToken: "fake-token",
//       bundleName: "test-bundle",
//       debug: true,
//     };

//     expect(prepareCoreOptions(argv)).toEqual(expectedCoreOptions);
//   });

//   it("should prepare bundle analyzer options correctly", () => {
//     const argv = {
//       ignorePatterns: ["*.map", "*.test.js"],
//       normalizeAssetsPattern: "[name]-[hash].js",
//     };

//     const expectedBundleAnalyzerOptions = {
//       ignorePatterns: ["*.map", "*.test.js"],
//       normalizeAssetsPattern: "[name]-[hash].js",
//     };

//     expect(prepareBundleAnalyzerOptions(argv)).toEqual(
//       expectedBundleAnalyzerOptions,
//     );
//   });

//   it("should run the CLI with valid arguments and call createAndUploadReport", async () => {
//     // Simulate process.argv with valid build directories
//     process.argv = [
//       "node",
//       "cli.js",
//       "./build",
//       "--bundle-name=my-bundle",
//       "--dry-run",
//       "--ignore-patterns=*.map",
//     ];

//     await runCli({
//       buildDirectories: ["./build"],
//       apiUrl: "https://api.codecov.io",
//       dryRun: true,
//       bundleName: "my-bundle",
//       debug: false,
//     });

//     expect(createAndUploadReport).toHaveBeenCalledWith(
//       [path.resolve(process.cwd(), "./build")],
//       {
//         apiUrl: "https://api.codecov.io",
//         dryRun: true,
//         uploadToken: undefined,
//         bundleName: "my-bundle",
//         debug: false,
//       },
//       {
//         ignorePatterns: undefined,
//         normalizeAssetsPattern: undefined,
//       },
//     );
//   });

//   it("should log an error and exit if there is a failure", async () => {
//     // Simulate an error in the CLI
//     vi.mocked(createAndUploadReport).mockRejectedValueOnce(
//       new Error("Test error"),
//     );

//     // Simulate process.argv
//     process.argv = [
//       "node",
//       "cli.js",
//       "./non-existent-dir",
//       "--bundle-name=my-bundle",
//     ];

//     await expect(
//       runCli({
//         buildDirectories: ["./non-existent-dir"],
//         apiUrl: "https://api.codecov.io",
//         dryRun: false,
//         bundleName: "my-bundle",
//         debug: false,
//       }),
//     ).rejects.toThrowError("process.exit called with code: 1");

//     expect(red).toHaveBeenCalledWith("An error occurred: Error: Test error");
//     expect(process.exit).toHaveBeenCalledWith(1);
//   });
// });
