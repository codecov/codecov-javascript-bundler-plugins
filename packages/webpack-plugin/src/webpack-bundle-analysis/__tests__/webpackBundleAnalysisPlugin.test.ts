import { webpackBundleAnalysisPlugin } from "../webpackBundleAnalysisPlugin";

describe("webpackBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = webpackBundleAnalysisPlugin({
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
