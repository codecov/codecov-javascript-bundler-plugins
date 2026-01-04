import { Output } from "@codecov/bundler-plugin-core";
import { describe, it, expect } from "vitest";
import { RspackBundleAnalysisPlugin } from "../rspackBundleAnalysisPlugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

describe("RspackBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("creates a plugin instance with apply method", () => {
      const plugin = new RspackBundleAnalysisPlugin({
        output: new Output(
          {
            apiUrl: "http://localhost",
            bundleName: "test-bundle",
            debug: false,
            dryRun: true,
            enableBundleAnalysis: true,
            retryCount: 1,
            uploadToken: "test-token",
            telemetry: false,
          },
          { metaFramework: "rspack" },
        ),
        pluginName: PLUGIN_NAME,
        pluginVersion: PLUGIN_VERSION,
      });

      expect(plugin).toBeDefined();
      expect(typeof plugin.apply).toBe("function");
    });
  });
});
