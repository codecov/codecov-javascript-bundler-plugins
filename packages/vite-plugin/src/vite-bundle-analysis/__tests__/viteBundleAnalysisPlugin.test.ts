import { viteBundleAnalysisPlugin } from "../viteBundleAnalysisPlugin";

describe("viteBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = viteBundleAnalysisPlugin({
        output: {},
        userOptions: {},
      });

      expect(plugin.version).toEqual("1");
      expect(plugin.name).toEqual("codecov-vite-bundle-analysis-plugin");
      expect(plugin.pluginVersion).toEqual("1.0.0");
      expect(plugin.vite?.generateBundle).toEqual(expect.any(Function));
    });
  });
});
