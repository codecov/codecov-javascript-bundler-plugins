import {
  type BundleAnalysisUploadPlugin,
  red,
} from "@codecov/bundler-plugin-core";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

export const nuxtBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
}) => ({
  version: "1",
  name: PLUGIN_NAME,
  pluginVersion: PLUGIN_VERSION,
  vite: {
    generateBundle(this, options) {
      // don't need to do anything if the bundle name is not present or empty
      if (
        !output.userOptions.bundleName ||
        output.userOptions.bundleName === ""
      ) {
        red("Bundle name is not present or empty. Skipping upload.");
        return;
      }

      output.bundleName = output.userOptions.bundleName;
      // add in bundle name if present
      if (options.name && options.name !== "") {
        output.bundleName = `${output.userOptions.bundleName}-${options.name}`;
      }

      if (options.dir?.includes("server")) {
        output.bundleName = `${output.bundleName}-server`;
      } else if (options.dir?.includes("client")) {
        output.bundleName = `${output.bundleName}-client`;
      }

      // append bundle output format to bundle name
      const format = options.format === "es" ? "esm" : options.format;
      output.bundleName = `${output.bundleName}-${format}`;

      // lock the bundle name
      output.internalOptions.frozenBundleName = true;

      // manually set this to avoid resetting in the vite plugin
      output.plugin = {
        name: PLUGIN_NAME,
        version: PLUGIN_VERSION,
      };

      // lock out the plugin details
      output.internalOptions.frozenPluginDetails = true;
    },
  },
});
