import { bundleAnalysisPluginFactory } from "../bundleAnalysisPluginFactory";

describe("bundleAnalysisPluginFactory", () => {
  it("returns a build start function", () => {
    const plugin = bundleAnalysisPluginFactory({
      userOptions: { bundleName: "test" },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
    });

    expect(plugin.buildStart).toEqual(expect.any(Function));
  });

  it("returns a build end function", () => {
    const plugin = bundleAnalysisPluginFactory({
      userOptions: { bundleName: "test" },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
    });

    expect(plugin.buildEnd).toEqual(expect.any(Function));
  });

  it("returns a write bundle function", () => {
    const plugin = bundleAnalysisPluginFactory({
      userOptions: { bundleName: "test" },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
    });

    expect(plugin.writeBundle).toEqual(expect.any(Function));
  });
});
