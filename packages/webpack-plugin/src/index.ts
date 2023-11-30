import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";

import { webpackBundleAnalysisPlugin } from "./webpack-bundle-analysis/webpackBundleAnalysisPlugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: webpackBundleAnalysisPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovWebpackPlugin: (options: Options) => any =
  codecovUnplugin.webpack;
