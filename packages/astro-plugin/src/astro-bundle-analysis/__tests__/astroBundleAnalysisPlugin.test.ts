import { Output } from "@codecov/bundler-plugin-core";
import { describe, it, expect } from "vitest";
import { astroBundleAnalysisPlugin } from "../astroBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

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
        pluginName: PLUGIN_NAME,
        pluginVersion: PLUGIN_VERSION,
      });

      expect(plugin).toMatchSnapshot();
    });
  });
});
