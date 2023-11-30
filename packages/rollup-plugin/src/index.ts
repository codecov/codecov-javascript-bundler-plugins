import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";

import { rollupBundleAnalysisPlugin } from "./rollup-bundle-analysis/rollupBundleAnalysisPlugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: rollupBundleAnalysisPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovRollupPlugin: (options: Options) => any =
  codecovUnplugin.rollup;
