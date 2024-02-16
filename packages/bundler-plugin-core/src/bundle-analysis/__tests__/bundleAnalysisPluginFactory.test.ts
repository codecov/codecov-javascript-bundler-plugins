import { type UnpluginContextMeta } from "unplugin";
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
      },
      bundleAnalysisUploadPlugin: () => ({
        version: "1",
        name: "plugin-name",
        pluginVersion: "1.0.0",
      }),
      unpluginMetaContext: {} as UnpluginContextMeta,
      sentryMetrics: undefined,
      handleRecoverableError() {
        return;
      },
    });

    expect(plugin).toMatchSnapshot();
  });
});
