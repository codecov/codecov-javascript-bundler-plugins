import { InvalidBundleNameError } from "../../errors/InvalidBundleNameError.ts";
import { type Options } from "../../types.ts";
import { normalizeOptions, type NormalizedOptions } from "../normalizeOptions";

interface Test {
  name: string;
  input: {
    options: Options;
  };
  expected: NormalizedOptions;
}

const tests: Test[] = [
  {
    name: "sets default values",
    input: {
      options: {},
    },
    expected: {
      bundleName: undefined,
      apiUrl: "https://api.codecov.io",
      dryRun: false,
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
      bundleName: "test-bundle",
      apiUrl: "https://api.example.com",
      dryRun: true,
    },
  },
];

describe("normalizeOptions", () => {
  it.each(tests)("$name", ({ input, expected }) => {
    const expectation = normalizeOptions(input.options);
    expect(expectation).toEqual(expected);
  });

  describe("invalid bundle name", () => {
    it("throws an error", () => {
      let err;
      try {
        normalizeOptions({ bundleName: "!bundle_name!" });
      } catch (e) {
        err = e;
      }

      expect(err).toBeInstanceOf(InvalidBundleNameError);
    });
  });
});
