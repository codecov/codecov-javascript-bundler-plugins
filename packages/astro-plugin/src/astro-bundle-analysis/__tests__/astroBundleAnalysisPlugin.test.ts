import { Output } from "@codecov/bundler-plugin-core";
import { describe, it, expect } from "vitest";
import { astroBundleAnalysisPlugin } from "../astroBundleAnalysisPlugin";

describe("astroBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = astroBundleAnalysisPlugin({
        target: "client",
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
