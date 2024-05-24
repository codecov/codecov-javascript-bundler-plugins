import { Output } from "@codecov/bundler-plugin-core";
import { describe, it, expect } from "vitest";
import { sveltekitBundleAnalysisPlugin } from "../sveltekitBundleAnalysisPlugin";

describe("sveltekitBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = sveltekitBundleAnalysisPlugin({
        output: new Output({
          apiUrl: "http://localhost",
          bundleName: "test-bundle",
          debug: false,
          dryRun: true,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "test-token",
        }),
      });

      expect(plugin).toMatchSnapshot();
    });
  });
});
