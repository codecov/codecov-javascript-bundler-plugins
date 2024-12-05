import {
  type BundleAnalysisUploadPlugin,
  red,
} from "@codecov/bundler-plugin-core";
import { getBundleName } from "./getBundleName";

export const sveltekitBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  pluginName,
  pluginVersion,
}) => ({
  version: output.version,
  name: pluginName,
  pluginVersion,
  vite: {
    generateBundle(this, options) {
      // TODO - remove this once we hard fail on not having a bundle name
      // don't need to do anything if the bundle name is not present or empty
      if (!output.bundleName || output.bundleName === "") {
        red("Bundle name is not present or empty. Skipping upload.");
        return;
      }

      const name = getBundleName(
        output.originalBundleName,
        options.dir,
        options.format,
        options.name,
      );

      output.unlockBundleName();
      output.setBundleName(name);
      output.lockBundleName();

      // manually set this to avoid resetting in the vite plugin
      output.setPlugin(pluginName, pluginVersion);
    },
  },
});
