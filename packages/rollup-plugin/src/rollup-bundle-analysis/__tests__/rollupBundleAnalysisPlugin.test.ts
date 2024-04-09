import { rollupBundleAnalysisPlugin } from "../rollupBundleAnalysisPlugin";

describe("rollupBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = rollupBundleAnalysisPlugin({
        output: {
          bundleName: "test",
        },
        options: {
          bundleName: "test",
          apiUrl: "http://localhost",
          dryRun: true,
          enableBundleAnalysis: true,
          retryCount: 1,
          debug: false,
        },
      });

      expect(plugin).toMatchSnapshot();
    });
  });
});
