import {
  red,
  type BundleAnalysisUploadPlugin,
} from "@codecov/bundler-plugin-core";
import type * as webpack from "webpack";

import {
  _internal_processAssets as processAssets,
  _internal_processChunks as processChunks,
  _internal_processModules as processModules,
} from "@codecov/webpack-plugin";

// @ts-expect-error this value is being replaced by rollup
const PLUGIN_NAME = __PACKAGE_NAME__ as string;
// @ts-expect-error this value is being replaced by rollup
const PLUGIN_VERSION = __PACKAGE_VERSION__ as string;

export const nextJSWebpackBundleAnalysisPlugin: BundleAnalysisUploadPlugin<{
  webpack: typeof webpack | null;
}> = ({ output, options: { webpack } }) => ({
  version: output.version,
  name: PLUGIN_NAME,
  pluginVersion: PLUGIN_VERSION,
  buildStart: () => {
    output.start();
    output.setPlugin(PLUGIN_NAME, PLUGIN_VERSION);
  },
  buildEnd: () => {
    output.end();
  },
  writeBundle: async () => {
    await output.write();
  },
  webpack(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      if (!webpack) {
        red(
          "Unable to run bundle analysis, Webpack wasn't passed successfully.",
        );
        return;
      }

      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        async () => {
          output.setBundleName(output.bundleName);
          // Webpack base chunk format options: https://webpack.js.org/configuration/output/#outputchunkformat
          if (typeof compilation.outputOptions.chunkFormat === "string") {
            if (compilation.name && compilation.name !== "") {
              output.setBundleName(`${output.bundleName}-${compilation.name}`);
            }

            let chunkFormat = compilation.outputOptions.chunkFormat;
            if (chunkFormat === "commonjs") {
              chunkFormat = "cjs";
            } else if (chunkFormat === "module") {
              chunkFormat = "esm";
            }

            output.setBundleName(`${output.bundleName}-${chunkFormat}`);
          }

          const compilationStats = compilation.getStats().toJson({
            assets: true,
            chunks: true,
            modules: true,
            builtAt: true,
            hash: true,
          });

          output.bundler = {
            name: "webpack",
            version: webpack.version,
          };

          const outputOptions = compilation.outputOptions;
          const { assets, chunks, modules } = compilationStats;

          if (assets) {
            const collectedAssets = await processAssets({
              assets,
              compilation,
            });

            output.assets = collectedAssets;
          }

          const chunkIdMap = new Map<number | string, string>();
          if (chunks) {
            output.chunks = processChunks({ chunks, chunkIdMap });
          }

          if (modules) {
            output.modules = processModules({ modules, chunkIdMap });
          }

          output.duration = Date.now() - (output.builtAt ?? 0);
          output.outputPath = outputOptions.path ?? "";

          // only output file if running dry run
          if (output.dryRun) {
            const { RawSource } = webpack.sources;
            compilation.emitAsset(
              `${output.bundleName}-stats.json`,
              new RawSource(output.bundleStatsToJson()),
            );
          }
        },
      );
    });
  },
});