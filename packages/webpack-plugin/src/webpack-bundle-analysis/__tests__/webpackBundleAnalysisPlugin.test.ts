import { webpackBundleAnalysisPlugin } from "../webpackBundleAnalysisPlugin";

describe("webpackBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = webpackBundleAnalysisPlugin({
        output: {},
        userOptions: {},
      });

      expect(plugin.version).toEqual("1");
      expect(plugin.name).toEqual("codecov-webpack-bundle-analysis-plugin");
      expect(plugin.pluginVersion).toEqual("1.0.0");
      expect(plugin.webpack).toEqual(expect.any(Function));
    });
  });
});
