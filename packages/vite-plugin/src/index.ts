/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Details for the Codecov Vite plugin.
 *
 * @example
 * ```typescript
 * // vite.config.js
 * import { defineConfig } from "vite";
 * import { codecovVitePlugin } from "@codecov/vite-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     // Put the Codecov vite plugin after all other plugins
 *     codecovVitePlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-vite-bundle",
 *       uploadToken: process.env.CODECOV_TOKEN,
 *     }),
 *   ],
 * });
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovVitePlugin: (options: Options) => any =
  codecovUnplugin.vite;
