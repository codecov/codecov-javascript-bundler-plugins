/* eslint-disable no-console */
import { type BundleAnalysisUploadPlugin } from "@codecov/bundler-plugin-core";

const PLUGIN_NAME = "codecov-esbuild-bundle-analysis-plugin";

export const esbuildBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  userOptions,
}) => {
  console.log("RUNNING HERE");
  return {
    version: "1",
    name: PLUGIN_NAME,
    pluginVersion: "1.0.0",
    esbuild: {
      setup(build) {
        const options = build.initialOptions;
        options.metafile = true;

        console.log(output);
        console.log(userOptions);
        console.log("esbuild setup", build);
      },
    },
  };
};
