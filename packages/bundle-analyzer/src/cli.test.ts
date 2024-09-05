import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { execSync, execFileSync } from "node:child_process";
import path from "node:path";
import * as url from "node:url";
import fs from "node:fs";

const runCLI = (args: string[]): string | undefined => {
  const cliPath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    "../dist/cli.cjs",
  );

  try {
    const cmd = "node";
    const allArgs = [cliPath, ...args];
    return execFileSync(cmd, allArgs, { encoding: "utf-8" });
  } catch (error) {
    // console.error("Full error:", error); // uncomment for debugging
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

  it("should exit with an error if build directory path is missing", () => {
    const output = runCLI([]);
    expect(output).toContain(
      "Not enough non-option arguments: got 0, need at least 1",
    );
  });

  it("should exit with an error if upload token is missing", () => {
    const output = runCLI(["./build", "--bundle-name=someName"]);
    expect(output).toContain(
      "Error: An upload token is required. Use --upload-token or set the CODECOV_UPLOAD_TOKEN environment variable.",
    );
  });

  it("should exit with success if upload token is in an env var", () => {
    // Set token via env var
    const originalToken = process.env.CODECOV_UPLOAD_TOKEN;
    process.env.CODECOV_UPLOAD_TOKEN = "token123";

    const output = runCLI(["./src", "--bundle-name=someName", "--dry-run"]);

    // Restore the original environment variable
    process.env.CODECOV_UPLOAD_TOKEN = originalToken;

    expect(output).toContain(
      `"bundleName":"someName","plugin":{"name":"@codecov/bundle-analyzer"`,
    );
  });

  it("should exit with success when valid inputs are provided", () => {
    const output = runCLI([
      "./src",
      "--bundle-name=someName",
      "--upload-token=token123",
      "--dry-run",
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
});
