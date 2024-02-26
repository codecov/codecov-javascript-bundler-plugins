import { type Options } from "../../types.ts";
import {
  normalizeOptions,
  type NormalizedOptionsResult,
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
      },
    },
    expected: {
      success: true,
      options: {
        bundleName: "test-bundle",
        apiUrl: "https://api.example.com",
        dryRun: true,
      },
    },
  },
  {
    name: "returns errors for invalid options",
    input: {
      options: {
        bundleName: "test-bundle",
        apiUrl: "not-a-url",
        // @ts-expect-error - passing an incorrect type to dry run
        dryRun: "not-a-boolean",
      },
    },
    expected: {
      success: false,
      errors: [
        `The apiUrl "not-a-url" is invalid. It must be a valid URL`,
        `The dryRun option "not-a-boolean" is invalid. It must be a boolean`,
      ],
    },
  },
  {
    name: "returns errors for invalid bundleName",
    input: {
      options: {
        bundleName: "test-bundle!",
      },
    },
    expected: {
      success: false,
      errors: [
        'The bundleName "test-bundle!" is invalid. It must match the pattern /^[\\w\\d_:/@\\.{}\\[\\]$-]+$/',
      ],
    },
  },
];

describe("normalizeOptions", () => {
  it.each(tests)("$name", ({ input, expected }) => {
    const expectation = normalizeOptions(input.options);
    expect(expectation).toEqual(expected);
  });
});
