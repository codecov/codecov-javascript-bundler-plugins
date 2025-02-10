import { describe, expect, it } from "vitest";
import { normalizePath } from "../normalizePath";
import { type MetaFramework } from "../../types";
interface Test {
  name: string;
  input: {
    path: string;
    format: string;
    metaFramework: MetaFramework;
  };
  expected: string;
}

const tests: Test[] = [
  {
    name: "should replace '[hash]' with '*'",
    input: {
      path: "test.123.chunk.js",
      format: "[name].[hash].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "can handle all base64 characters and '-'",
    input: {
      path: "test.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=-.js",
      format: "[name].[hash].js",
      metaFramework: "webpack",
    },
    expected: "test.*.js",
  },
  {
    name: "should replace '[contenthash]' with '*'",
    input: {
      path: "test.123.chunk.js",
      format: "[name].[contenthash].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should replace '[fullhash]' with '*'",
    input: {
      path: "test.123.chunk.js",
      format: "[name].[fullhash].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should replace '[chunkhash]' with '*'",
    input: {
      path: "test.123.chunk.js",
      format: "[name].[chunkhash].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should replace multiple hash format occurrences '*'",
    input: {
      path: "test.123.456.chunk.js",
      format: "[name].[hash].[chunkhash].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.*.chunk.js",
  },
  {
    name: "should brute force wildcard if no hash format is found",
    input: {
      path: "test.12345678.chunk.js",
      format: "[name].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "handle case where [extname] is used",
    input: {
      path: "test.12345678.js",
      format: "[name].[hash][extname]",
      metaFramework: "webpack",
    },
    expected: "test.*.js",
  },
  {
    name: "input path with no extension present",
    input: {
      path: "test.12345678",
      format: "[name].[hash]",
      metaFramework: "webpack",
    },
    expected: "test.*",
  },
  {
    name: "should replace '[hash:22]' with '*'",
    input: {
      path: "test.CoScjXRp_rD9HKS--kYO73.chunk.js",
      format: "[name].[hash:22].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should replace '[contenthash:22]' with '*'",
    input: {
      path: "test.CoScjXRp_rD9HKS--kYO73.chunk.js",
      format: "[name].[contenthash:22].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should replace '[fullhash:22]' with '*'",
    input: {
      path: "test.CoScjXRp_rD9HKS--kYO73.chunk.js",
      format: "[name].[fullhash:22].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should replace '[chunkhash:22]' with '*'",
    input: {
      path: "test.CoScjXRp_rD9HKS--kYO73.chunk.js",
      format: "[name].[chunkhash:22].chunk.js",
      metaFramework: "webpack",
    },
    expected: "test.*.chunk.js",
  },
  {
    name: "should handle vite legacy builds",
    input: {
      path: "test-legacy.12345678.js",
      // in testing i've found that the format is just an empty string so we
      // have to brute force it in a different way
      format: "",
      metaFramework: "vite",
    },
    expected: "test-legacy.*.js",
  },
];

describe("normalizePath", () => {
  it.each(tests)("$name", ({ input, expected }) => {
    const expectation = normalizePath(
      input.path,
      input.format,
      input.metaFramework,
    );
    expect(expectation).toEqual(expected);
  });
});
