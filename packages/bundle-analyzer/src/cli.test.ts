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

describe("CLI functions only", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console.log to capture output
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {
      return;
    });
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  it("should run with dry run and log the report", async () => {
    process.argv = [
      "node",
      "cli.ts",
      ".",
      "--bundle-name=my-bundle",
      "--dry-run",
    ];

    // import the CLI module only after process.argv set
    const cliModule = await import("./cli");

    const argv = {
      buildDirectories: ["."],
      apiUrl: "https://custom-api.io",
      dryRun: true,
      uploadToken: "fake-token",
      bundleName: "test-bundle",
      debug: false,
    };

    await cliModule.runCli(argv);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should run and return error", async () => {
    process.argv = [
      "node",
      "cli.ts",
      "/directory/that/doesnt/exist",
      "--bundle-name=my-bundle",
      "--dry-run",
    ];

    // import the CLI module only after process.argv set
    const cliModule = await import("./cli");

    const argv = {
      buildDirectories: ["/directory/that/doesnt/exist"],
      apiUrl: "https://custom-api.io",
      dryRun: true,
      uploadToken: "fake-token",
      bundleName: "test-bundle",
      debug: false,
    };

    await expect(cliModule.runCli(argv)).rejects.toThrowError();
  });
});
