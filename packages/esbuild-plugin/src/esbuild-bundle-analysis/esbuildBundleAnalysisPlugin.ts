import {
  type Asset,
  type Chunk,
  type Module,
  type BundleAnalysisUploadPlugin,
  red,
  normalizePath,
} from "@codecov/bundler-plugin-core";

const PLUGIN_NAME = "codecov-esbuild-bundle-analysis-plugin";

export const rollupBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  userOptions,
}) => ({});
