import { webpackBundleAnalysisPlugin } from "../webpackBundleAnalysisPlugin";

describe("webpackBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = webpackBundleAnalysisPlugin({
        output: {
          bundleName: "test",
        },
        options: {
          bundleName: "test",
          apiUrl: "http://localhost",
          dryRun: true,
          enableBundleAnalysis: true,
          retryCount: 1,
        },
      });

      expect(plugin).toMatchSnapshot();
    });
  });
});
