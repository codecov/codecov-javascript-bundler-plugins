import { viteBundleAnalysisPlugin } from "../viteBundleAnalysisPlugin";

describe("viteBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = viteBundleAnalysisPlugin({
        output: {
          bundleName: "test",
        },
        userOptions: {
          bundleName: "test",
        },
      });

      expect(plugin).toMatchSnapshot();
    });
  });
});
