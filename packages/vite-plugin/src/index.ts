import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";

import { viteBundleAnalysisPlugin } from "./vite-bundle-analysis/viteBundleAnalysisPlugin";

export interface BundleTransformOptions {
  fileName?: string;
  moduleOriginalSize?: boolean;
}

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: viteBundleAnalysisPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovVitePlugin: (options: Options) => any =
  codecovUnplugin.vite;
