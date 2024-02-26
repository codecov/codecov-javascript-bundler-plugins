import { bundleAnalysisPluginFactory } from "../bundleAnalysisPluginFactory";

describe("bundleAnalysisPluginFactory", () => {
  it("returns a plugin functions", () => {
    const plugin = bundleAnalysisPluginFactory({
      options: { bundleName: "test", apiUrl: "http://localhost", dryRun: true },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
    });

    expect(plugin).toMatchSnapshot();
  });
});
