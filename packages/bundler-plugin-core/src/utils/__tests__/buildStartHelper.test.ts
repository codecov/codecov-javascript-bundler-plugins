import { describe, beforeAll, afterAll, it, expect, vi } from "vitest";
import { type Output } from "../../types";
import { buildStartHelper } from "../buildStartHelper";

describe("buildStartHelper", () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(1000);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should set builtAt to the current time", () => {
    const output: Output = {
      bundleName: "test-bundle",
    };

    buildStartHelper(output);

    expect(output?.builtAt).toBe(1000);
  });
});
