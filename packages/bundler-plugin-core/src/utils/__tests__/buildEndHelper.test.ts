import { describe, beforeAll, afterAll, it, expect, vi } from "vitest";
import { type Output } from "../../types";
import { buildEndHelper } from "../buildEndHelper";

describe("buildEndHelper", () => {
  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(1000);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("builtAt is set", () => {
    it("should set duration to the difference between now and builtAt", () => {
      const output: Output = {
        bundleName: "test-bundle",
        builtAt: 100,
      };

      buildEndHelper(output);

      expect(output?.duration).toBe(900);
    });
  });

  describe("builtAt is not set", () => {
    it("should set duration to the difference between now and 0", () => {
      const output: Output = {
        bundleName: "test-bundle",
      };

      buildEndHelper(output);

      expect(output?.duration).toBe(1000);
    });
  });
});
