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
          debug: false,
        },
      });

      expect(plugin).toMatchSnapshot({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pluginVersion: expect.stringMatching(/\d+\.\d+\.\d+-beta.\d/),
      });
    });
  });
});
