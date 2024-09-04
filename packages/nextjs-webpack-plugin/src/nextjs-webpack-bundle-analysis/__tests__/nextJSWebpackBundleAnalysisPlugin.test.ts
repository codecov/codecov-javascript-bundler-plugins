import { Output } from "@codecov/bundler-plugin-core";
import { describe, it, expect } from "vitest";
import * as webpack from "webpack";
import { nextJSWebpackBundleAnalysisPlugin } from "../nextJSWebpackBundleAnalysisPlugin";

describe("webpackBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = nextJSWebpackBundleAnalysisPlugin({
        output: new Output({
          apiUrl: "http://localhost",
          bundleName: "test-bundle",
          debug: false,
          dryRun: true,
          enableBundleAnalysis: true,
          retryCount: 1,
          uploadToken: "test-token",
        }),
        options: {
          webpack: webpack,
        },
      });

      expect(plugin).toMatchSnapshot();
    });
  });
});
