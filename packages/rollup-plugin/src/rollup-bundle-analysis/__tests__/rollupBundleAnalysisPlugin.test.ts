import { rollupBundleAnalysisPlugin } from "../rollupBundleAnalysisPlugin";

describe("rollupBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = rollupBundleAnalysisPlugin({
        output: {
          bundleName: "test",
        },
        userOptions: {
          bundleName: "test",
        },
      });

      expect(plugin.version).toEqual("1");
      expect(plugin.name).toEqual("codecov-rollup-bundle-analysis-plugin");
      expect(plugin.pluginVersion).toEqual("1.0.0");
      expect(plugin.rollup?.generateBundle).toEqual(expect.any(Function));
    });
  });
});
