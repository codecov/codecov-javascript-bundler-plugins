import { viteBundleAnalysisPlugin } from "../viteBundleAnalysisPlugin";

describe("viteBundleAnalysisPlugin", () => {
  describe("when called", () => {
    it("returns a plugin object", () => {
      const plugin = viteBundleAnalysisPlugin({
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
