import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  beforeEach,
} from "vitest";
import { exec, execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import * as url from "node:url";
import fs from "node:fs";

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

// Spawn the CLI asynchronously: a synchronous spawn blocks the vitest worker
// thread, which under vitest 3.2 trips the "onTaskUpdate" RPC timeout on slower
// machines (e.g. CI) even though the test itself passes.
export const runCLI = async (args: string[]): Promise<string | undefined> => {
  const cliPath = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    "../src/cli.ts",
  );

  try {
    const { stdout } = await execFileAsync("npx", ["tsx", cliPath, ...args], {
      encoding: "utf-8",
    });
    return stdout;
  } catch (error) {
    if (error instanceof Error) {
      return JSON.stringify(error);
    }
    return "An unknown error occurred.";
  }
};

describe("CLI script", () => {
  beforeAll(async () => {
    // Ensure the build completes before tests
    await execAsync("pnpm run build");

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

  it("should exit with an error if build directory paths are missing", async () => {
    const output = await runCLI([]);
    expect(output).toContain(
      "Not enough non-option arguments: got 0, need at least 1",
    );
  });

  it("should exit with success if upload token is in an env var", async () => {
    const originalToken = process.env.CODECOV_UPLOAD_TOKEN;
    process.env.CODECOV_UPLOAD_TOKEN = "token123";

    const output = await runCLI([
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

  it("should exit with success when valid inputs are provided", async () => {
    const output = await runCLI([
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

  it("should log an error message if the directory doesn't exist", async () => {
    const output = await runCLI([
      "./doesnt-exist",
      "--bundle-name=someName",
      "--upload-token=token123",
    ]);

    expect(output).toContain("An error occurred:");
  });

  it("should handle multiple ignore patterns correctly", async () => {
    const output = await runCLI([
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

  it("should log an error for invalid CLI arguments", async () => {
    const output = await runCLI([
      "./src",
      "../bundle-analyzer",
      "--bundle-name=someName",
      "--invalid-option",
    ]);

    expect(output).toContain("Unknown argument");
  });
});

describe("test CLI functions directly", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let cliModule: typeof import("./cli");
  beforeAll(async () => {
    process.argv = ["node", "cli.ts", ".", "--dry-run", "--bundle-name=test"];
    cliModule = await import("./cli");
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {
      return;
    }) as unknown as ReturnType<typeof vi.spyOn>;
  });

  it("should run with dry run and log the report", async () => {
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

  it("should run and return error if directory does not exist", async () => {
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

  it("should return error if directories not supplied", async () => {
    const argv = {
      buildDirectories: [],
      apiUrl: "https://custom-api.io",
      dryRun: true,
      uploadToken: "fake-token",
      bundleName: "test-bundle",
      debug: false,
    };

    await expect(cliModule.runCli(argv)).rejects.toThrowError();
  });

  it("should load options from a configuration file successfully", async () => {
    const configFilePath = path.resolve("test-config.json");

    const argv = {
      buildDirectories: ["."],
      apiUrl: "https://custom-api.io",
      dryRun: true,
      uploadToken: "fake-token",
      bundleName: "this-is-the-name",
      debug: false,
      configFile: configFilePath,
    };

    // Create a dummy config file for the test
    fs.writeFileSync(
      configFilePath,
      JSON.stringify({
        bundleName: "this-name-should-be-ignored",
        oidc: {
          useGitHubOIDC: false,
        },
      }),
    );

    await cliModule.runCli(argv);

    fs.unlinkSync(configFilePath); // Clean up after test

    expect(consoleSpy).toHaveBeenCalled();
    // the CLI argument should override anything supplied in the config file.
    // Importing ./cli triggers a stray top-level runCli invocation, so match
    // the report this test produced rather than assuming a call index.
    const loggedReports = consoleSpy.mock.calls.map((call) => String(call[0]));
    expect(
      loggedReports.some((report) =>
        report.includes(`bundleName":"this-is-the-name"`),
      ),
    ).toBe(true);
    expect(
      loggedReports.some((report) =>
        report.includes(`bundleName":"this-name-should-be-ignored"`),
      ),
    ).toBe(false);
  });

  it("should load options from a configuration file with error if file does not exist", async () => {
    const configFilePath = path.resolve("not-exists.json");

    const argv = {
      buildDirectories: ["."],
      apiUrl: "https://custom-api.io",
      dryRun: true,
      uploadToken: "fake-token",
      bundleName: "this-is-the-name",
      debug: false,
      configFile: configFilePath,
    };

    await expect(cliModule.runCli(argv)).rejects.toThrowError();
  });
});
