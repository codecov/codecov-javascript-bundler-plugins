import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";

import { esbuildBundleAnalysisPlugin } from "./esbuild-bundle-analysis/esbuildBundleAnalysisPlugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: esbuildBundleAnalysisPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovRollupPlugin: (options: Options) => any =
  codecovUnplugin.rollup;
