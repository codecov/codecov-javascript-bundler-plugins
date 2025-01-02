import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";
import { type Options } from "../../types.ts";
import {
  normalizeOptions,
  type NormalizedOptionsResult,
  handleErrors,
} from "../normalizeOptions";

interface Test {
  name: string;
  input: {
    options: Options;
  };
  expected: NormalizedOptionsResult;
}

const tests: Test[] = [
  {
    name: "sets default values",
    input: {
      options: {
        bundleName: "test-bundle",
      },
    },
    expected: {
      success: true,
      options: {
        bundleName: "test-bundle",
        apiUrl: "https://api.codecov.io",
        dryRun: false,
        retryCount: 3,
        enableBundleAnalysis: false,
        debug: false,
        telemetry: true,
      },
    },
  },
  {
    name: "can override default values",
    input: {
      options: {
        bundleName: "test-bundle",
        apiUrl: "https://api.example.com",
        dryRun: true,
        retryCount: 1,
        enableBundleAnalysis: true,
        uploadToken: "test-token",
        uploadOverrides: {
          branch: "test-branch",
          build: "test-build",
          compareSha: "test-compare-sha",
          sha: "test-sha",
          slug: "test-slug",
          pr: "1234",
        },
        debug: true,
        gitService: "bitbucket",
        telemetry: false,
        oidc: {
          useGitHubOIDC: true,
          gitHubOIDCTokenAudience: "https://codecov.io",
        },
      },
    },
    expected: {
      success: true,
      options: {
        bundleName: "test-bundle",
        apiUrl: "https://api.example.com",
        dryRun: true,
        retryCount: 1,
        enableBundleAnalysis: true,
        uploadToken: "test-token",
        uploadOverrides: {
          branch: "test-branch",
          build: "test-build",
          compareSha: "test-compare-sha",
          sha: "test-sha",
          slug: "test-slug",
          pr: "1234",
        },
        debug: true,
        gitService: "bitbucket",
        telemetry: false,
        oidc: {
          useGitHubOIDC: true,
          gitHubOIDCTokenAudience: "https://codecov.io",
        },
      },
    },
  },
  {
    name: "returns invalid type error messages when types are mismatched",
    input: {
      options: {
        // @ts-expect-error - testing invalid input
        apiUrl: 123,
        // @ts-expect-error - testing invalid input
        bundleName: 123,
        // @ts-expect-error - testing invalid input
        dryRun: "true",
        // @ts-expect-error - testing invalid input
        retryCount: "3",
        // @ts-expect-error - testing invalid input
        enableBundleAnalysis: "false",
        // @ts-expect-error - testing invalid input
        uploadToken: 123,
        uploadOverrides: {
          // @ts-expect-error - testing invalid input
          branch: 123,
          // @ts-expect-error - testing invalid input
          build: 123,
          // @ts-expect-error - testing invalid input
          compareSha: 123,
          // @ts-expect-error - testing invalid input
          sha: 123,
          // @ts-expect-error - testing invalid input
          slug: 123,
          // @ts-expect-error - testing invalid input
          pr: 123,
        },
        // @ts-expect-error - testing invalid input
        debug: "true",
        // @ts-expect-error - testing invalid input
        gitService: 123,
        // @ts-expect-error - testing invalid input
        telemetry: "true",
        oidc: {
          // @ts-expect-error - testing invalid input
          useGitHubOIDC: "true",
          // @ts-expect-error - testing invalid input
          gitHubOIDCTokenAudience: 123,
        },
      },
    },
    expected: {
      success: false,
      errors: [
        "`apiUrl` must be a string.",
        "`bundleName` must be a string.",
        "`dryRun` must be a boolean.",
        "`retryCount` must be a number.",
        "`enableBundleAnalysis` must be a boolean.",
        "`uploadToken` must be a string.",
        "`branch` must be a string.",
        "`build` must be a string.",
        "`compareSha` must be a string.",
        "`pr` must be a string.",
        "`sha` must be a string.",
        "`slug` must be a string.",
        "`debug` must be a boolean.",
        "`gitService` must be a valid git service.",
        "`useGitHubOIDC` must be a boolean.",
        "`gitHubOIDCTokenAudience` must be a string.",
        "`telemetry` must be a boolean.",
      ],
    },
  },
  {
    name: "apiUrl does not match URL format, returns format error message",
    input: {
      options: {
        apiUrl: "invalid-url",
        bundleName: "test-bundle",
      },
    },
    expected: {
      success: false,
      errors: ["apiUrl: `invalid-url` is not a valid URL."],
    },
  },
  {
    name: "bundleName is not provided, returns required error message",
    input: {
      options: {
        bundleName: undefined,
      },
    },
    expected: {
      success: false,
      errors: [
        "`bundleName` is required for uploading bundle analysis information.",
      ],
    },
  },
  {
    name: "bundleName does not match format, returns format error message",
    input: {
      options: {
        bundleName: "!invalid-name!",
      },
    },
    expected: {
      success: false,
      errors: [
        "bundleName: `!invalid-name!` does not match format: `/^[wd_:/@.{}[]$-]+$/`.",
      ],
    },
  },
  {
    name: "retry count is a negative number, returns positive number error message",
    input: {
      options: {
        bundleName: "test-bundle",
        retryCount: -1,
      },
    },
    expected: {
      success: false,
      errors: ["`retryCount` must be a positive number."],
    },
  },
  {
    name: "retry count is a floating number, returns integer number error message",
    input: {
      options: {
        bundleName: "test-bundle",
        retryCount: 1.23,
      },
    },
    expected: {
      success: false,
      errors: ["`retryCount` must be an integer."],
    },
  },
];

describe("normalizeOptions", () => {
  it.each(tests)("$name", ({ input, expected }) => {
    const expectation = normalizeOptions(input.options);
    expect(expectation).toEqual(expected);
  });
});

describe("handleErrors", () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log");
  });

  afterEach(() => {
    consoleSpy.mockReset();
  });

  describe("there is a bundleName error", () => {
    it("logs out the error message", () => {
      handleErrors({
        success: false,
        errors: [
          "`bundleName` is required for uploading bundle analysis information.",
        ],
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.lastCall?.[0]).toStrictEqual(
        expect.stringContaining(
          "`bundleName` is required for uploading bundle analysis information.",
        ),
      );
    });

    it("returns shouldExit as true", () => {
      const { shouldExit } = handleErrors({
        success: false,
        errors: [
          "`bundleName` is required for uploading bundle analysis information.",
        ],
      });
      expect(shouldExit).toBeTruthy();
    });
  });

  describe("there is no bundleName error", () => {
    it("logs out the error message", () => {
      handleErrors({
        success: false,
        errors: [
          "`bundleName` is required for uploading bundle analysis information.",
        ],
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.lastCall?.[0]).toStrictEqual(
        expect.stringContaining(
          "`bundleName` is required for uploading bundle analysis information.",
        ),
      );
    });

    it("returns shouldExit as false", () => {
      const { shouldExit } = handleErrors({
        success: false,
        errors: ["random error"],
      });
      expect(shouldExit).toBeFalsy();
    });
  });
});
