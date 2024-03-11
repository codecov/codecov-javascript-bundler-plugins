/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  codecovUnpluginFactory,
  type Options,
} from "@codecov/bundler-plugin-core";

import { rollupBundleAnalysisPlugin } from "./rollup-bundle-analysis/rollupBundleAnalysisPlugin";

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: rollupBundleAnalysisPlugin,
});

// eslint-disable-next-line isaacscript/complete-sentences-jsdoc
/**
 * Details for the Codecov Rollup plugin.
 *
 * @param {Options} options - See {@link @codecov/bundler-plugin-core!Options | Options} for more
 *        details.
 *
 * @example
 * ```typescript
 * // rollup.config.js
 * import { defineConfig } from "rollup";
 * import { codecovRollupPlugin } from "@codecov/rollup-plugin";
 *
 * export default defineConfig({
 *   plugins: [
 *     // Put the Codecov rollup plugin after all other plugins
 *     codecovRollupPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-rollup-bundle",
 *       uploadToken: process.env.CODECOV_TOKEN,
 *     }),
 *   ],
 * });
 * ```
 */
export const codecovRollupPlugin: (options: Options) => any =
  codecovUnplugin.rollup;
