import { bundleAnalysisPluginFactory } from "../bundleAnalysisPluginFactory";

describe("bundleAnalysisPluginFactory", () => {
  it("returns a plugin functions", () => {
    const plugin = bundleAnalysisPluginFactory({
      userOptions: { bundleName: "test" },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
    });

    expect(plugin).toMatchSnapshot();
  });
});
