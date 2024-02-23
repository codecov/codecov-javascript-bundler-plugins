import {
  type Options,
  codecovUnpluginFactory,
} from "@codecov/bundler-plugin-core";

import { esbuildBundleAnalysisPlugin } from "./esbuild-bundle-analysis/esbuildBundleAnalysisPlugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: esbuildBundleAnalysisPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovEsbuildPlugin: (options: Options) => any =
  codecovUnplugin.esbuild;
