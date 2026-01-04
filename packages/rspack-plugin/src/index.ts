import {
  normalizeOptions,
  type Options,
  checkNodeVersion,
  Output,
  handleErrors,
  createSentryInstance,
  telemetryPlugin,
} from "@codecov/bundler-plugin-core";

import { rspackBundleAnalysisPlugin } from "./rspack-bundle-analysis/rspackBundleAnalysisPlugin";

import {
  findFilenameFormat,
  processAssets,
  processChunks,
  processModules,
} from "./rspack-bundle-analysis/utils";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

interface CodecovRspackPluginOptions extends Options {}

/**
 * Convert UnpluginOptions to a standard webpack/Rspack plugin with apply method
 */
function toStandardPlugin(unpluginOptions: any): any {
  return {
    name: unpluginOptions.name,
    apply: (compiler: any) => {
      if (unpluginOptions.buildStart) {
        compiler.hooks.thisCompilation.tap(unpluginOptions.name, () => {
          // Call buildStart asynchronously without blocking
          unpluginOptions.buildStart().catch((err: Error) => {
            console.error(`Error in ${unpluginOptions.name}:`, err);
          });
        });
      }
    },
  };
}

class CodecovRspackPlugin {
  private options: CodecovRspackPluginOptions;

  constructor(options: CodecovRspackPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: any): void {
    if (checkNodeVersion({ framework: "rspack" } as any)) {
      return;
    }

    const normalizedOptions = normalizeOptions(this.options);
    if (!normalizedOptions.success) {
      const { shouldExit } = handleErrors(normalizedOptions);

      if (shouldExit) {
        throw new Error(
          `Codecov plugin configuration error: ${normalizedOptions.errors.join(", ")}`,
        );
      }
      return;
    }

    const options = normalizedOptions.options;
    const sentryConfig = createSentryInstance({
      telemetry: options.telemetry,
      isDryRun: options.dryRun,
      pluginName: PLUGIN_NAME,
      pluginVersion: PLUGIN_VERSION,
      options,
      bundler: "rspack",
    });

    const output = new Output(
      options,
      { metaFramework: "rspack" },
      sentryConfig,
    );

    if (options.enableBundleAnalysis) {
      // Add telemetry plugin
      const telemetry = telemetryPlugin({
        sentryClient: sentryConfig.sentryClient,
        sentryScope: sentryConfig.sentryScope,
        telemetry: options.telemetry,
      });
      toStandardPlugin(telemetry).apply(compiler);

      // Add bundle analysis plugin
      const bundleAnalysis = rspackBundleAnalysisPlugin({
        output,
        pluginName: PLUGIN_NAME,
        pluginVersion: PLUGIN_VERSION,
      });
      bundleAnalysis.apply(compiler);
    }
  }
}

/**
 * Details for the Codecov Rspack plugin.
 *
 * @example
 * ```typescript
 * // rspack.config.js
 * const path = require("path");
 * const { codecovRspackPlugin } = require("@codecov/rspack-plugin");
 *
 * module.exports = {
 *   entry: "./src/index.js",
 *   mode: "production",
 *   output: {
 *     filename: "main.js",
 *     path: path.resolve(__dirname, "dist"),
 *   },
 *   plugins: [
 *     codecovRspackPlugin({
 *       enableBundleAnalysis: true,
 *       bundleName: "example-rspack-bundle",
 *       gitService: "github",
 *     }),
 *   ],
 * };
 * ```
 *
 * @see {@link @codecov/bundler-plugin-core!Options | Options} for list of options.
 */
export const codecovRspackPlugin = (
  options: CodecovRspackPluginOptions = {},
): CodecovRspackPlugin => {
  return new CodecovRspackPlugin(options);
};

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to expose the rspack bundle analysis plugin that can be combined with other
 * plugins to create a single plugin for a given meta-framework.
 *
 * @internal
 */
export const _internal_rspackBundleAnalysisPlugin = rspackBundleAnalysisPlugin;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to find the filename format for a given compilation.
 *
 * @internal
 */
export const _internal_findFilenameFormat = findFilenameFormat;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to process rspack assets in other plugins.
 *
 * @internal
 */
export const _internal_processAssets = processAssets;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to process rspack chunks in other plugins.
 *
 * @internal
 */
export const _internal_processChunks = processChunks;

/**
 * Do not use this plugin directly. For internal use only.
 *
 * Used to process rspack modules in other plugins.
 *
 * @internal
 */
export const _internal_processModules = processModules;

export { CodecovRspackPlugin as default };
