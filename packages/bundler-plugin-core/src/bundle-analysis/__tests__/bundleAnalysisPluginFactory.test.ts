import { bundleAnalysisPluginFactory } from "../bundleAnalysisPluginFactory";

describe("bundleAnalysisPluginFactory", () => {
  it("returns a plugin functions", () => {
    const plugin = bundleAnalysisPluginFactory({
      options: {
        bundleName: "test",
        apiUrl: "http://localhost",
        dryRun: true,
        enableBundleAnalysis: true,
        retryCount: 3,
        uploadToken: "test-token",
        debug: false,
      },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
    });

    expect(plugin).toMatchSnapshot();
  });
});
