import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeBundleAnalyzerOptions } from "./options";
import { type Output } from "@codecov/bundler-plugin-core";

// @ts-expect-error - mock is missing some required fields for brevity
const mockOutput: Output = {
  bundleStatsToJson: vi.fn().mockReturnValue('{"some": "data"}'),
};

describe("BundleAnalyzerOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeBundleAnalyzerOptions", () => {
    it("should return default options when no input is provided", () => {
      const normalizedOptions = normalizeBundleAnalyzerOptions();
      expect(normalizedOptions.beforeReportUpload).toBeDefined();
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    it("should merge user-provided options with default options", async () => {
      const customBeforeReportUpload = vi.fn(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (original: Output) => original,
      );

      const normalizedOptions = normalizeBundleAnalyzerOptions({
        beforeReportUpload: customBeforeReportUpload,
      });

      expect(normalizedOptions.beforeReportUpload).toBe(
        customBeforeReportUpload,
      );
    });

    it("should use default beforeReportUpload if not provided", async () => {
      const normalizedOptions = normalizeBundleAnalyzerOptions();

      const overriddenOutput =
        await normalizedOptions.beforeReportUpload(mockOutput);

      expect(overriddenOutput).toBe(mockOutput);
    });
  });

  describe("defaultBundleAnalyzerOptions", () => {
    it("default beforeReportUpload should return the original output", async () => {
      const defaultBeforeReportUpload =
        normalizeBundleAnalyzerOptions().beforeReportUpload;

      const overriddenOutput = await defaultBeforeReportUpload(mockOutput);

      expect(overriddenOutput).toBe(mockOutput);
    });
  });
});
