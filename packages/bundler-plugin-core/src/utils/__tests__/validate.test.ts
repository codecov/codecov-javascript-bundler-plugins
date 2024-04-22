import { describe, it, expect } from "vitest";
import { validateSHA } from "../validate.ts";

interface Test {
  name: string;
  input: {
    commitSHA: string;
    requestedLength?: number;
  };
  expected: boolean;
}

const tests: Test[] = [
  {
    name: "returns true for a valid SHA",
    input: {
      commitSHA: "1234567890abcdef1234567890abcdef12345678",
    },
    expected: true,
  },
  {
    name: "returns true for a valid SHA with a different length",
    input: {
      commitSHA: "1234567",
      requestedLength: 7,
    },
    expected: true,
  },

  {
    name: "returns false for invalid SHA",
    input: {
      commitSHA: "not-a-valid-sha",
    },
    expected: false,
  },
];

describe("validateSHA", () => {
  it.each(tests)("$name", ({ input, expected }) => {
    const expectation = validateSHA(input.commitSHA, input.requestedLength);
    expect(expectation).toEqual(expected);
  });
});
