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

      expect(plugin).toMatchSnapshot();
    });
  });
});
