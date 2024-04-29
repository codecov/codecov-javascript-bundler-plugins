import { Output } from "@codecov/bundler-plugin-core";
import { describe, it, expect } from "vitest";
import { nuxtBundleAnalysisPlugin } from "../nuxtBundleAnalysisPlugin";

describe("nuxtBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = nuxtBundleAnalysisPlugin({
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
