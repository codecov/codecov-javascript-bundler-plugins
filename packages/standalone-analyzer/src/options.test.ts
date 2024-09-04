import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeStandaloneOptions } from "./options";
import { type Output } from "@codecov/bundler-plugin-core";

// @ts-expect-error - mock is missing some required fields for brevity
const mockOutput: Output = {
  bundleStatsToJson: vi.fn().mockReturnValue('{"some": "data"}'),
};

describe("StandaloneOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeStandaloneOptions", () => {
    it("should return default options when no input is provided", () => {
      const normalizedOptions = normalizeStandaloneOptions();
      expect(normalizedOptions.dryRunner).toBeDefined();
      expect(normalizedOptions.reportOverrider).toBeDefined();
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    it("should merge user-provided options with default options", async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const customDryRunner = vi.fn(async () => {});
      // eslint-disable-next-line @typescript-eslint/require-await
      const customReportOverrider = vi.fn(async (original: Output) => original);

      const normalizedOptions = normalizeStandaloneOptions({
        dryRunner: customDryRunner,
        reportOverrider: customReportOverrider,
      });

      expect(normalizedOptions.dryRunner).toBe(customDryRunner);
      expect(normalizedOptions.reportOverrider).toBe(customReportOverrider);
    });

    it("should use default dryRunner if not provided", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      const normalizedOptions = normalizeStandaloneOptions();

      await normalizedOptions.dryRunner(mockOutput);

      expect(consoleSpy).toHaveBeenCalledWith('{"some": "data"}');
      consoleSpy.mockRestore();
    });

    it("should use default reportOverrider if not provided", async () => {
      const normalizedOptions = normalizeStandaloneOptions();

      const overriddenOutput =
        await normalizedOptions.reportOverrider(mockOutput);

      expect(overriddenOutput).toBe(mockOutput);
    });
  });

  describe("defaultStandaloneOptions", () => {
    it("default dryRunner should log JSON output", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      const defaultDryRunner = normalizeStandaloneOptions().dryRunner;

      await defaultDryRunner(mockOutput);

      expect(consoleSpy).toHaveBeenCalledWith('{"some": "data"}');
      consoleSpy.mockRestore();
    });

    it("default reportOverrider should return the original output", async () => {
      const defaultReportOverrider =
        normalizeStandaloneOptions().reportOverrider;

      const overriddenOutput = await defaultReportOverrider(mockOutput);

      expect(overriddenOutput).toBe(mockOutput);
    });
  });
});
