import { type Output } from "@codecov/bundler-plugin-core";
import { processAssets, processChunks, processModules } from "./utils";

interface RspackBundleAnalysisPluginArgs {
  output: Output;
  pluginName: string;
  pluginVersion: string;
}

class RspackBundleAnalysisPlugin {
  private output: Output;
  private pluginName: string;
  private pluginVersion: string;

  constructor({
    output,
    pluginName,
    pluginVersion,
  }: RspackBundleAnalysisPluginArgs) {
    this.output = output;
    this.pluginName = pluginName;
    this.pluginVersion = pluginVersion;
  }

  apply(compiler: any): void {
    // Access Rspack via compiler.rspack
    const rspack = compiler.rspack;

    // buildStart hook
    compiler.hooks.run.tapAsync(
      this.pluginName,
      (_compiler: any, callback: any) => {
        this.output.start();
        this.output.setPlugin(this.pluginName, this.pluginVersion);
        callback();
      },
    );

    compiler.hooks.watchRun.tapAsync(
      this.pluginName,
      (_compiler: any, callback: any) => {
        this.output.start();
        this.output.setPlugin(this.pluginName, this.pluginVersion);
        callback();
      },
    );

    // buildEnd hook (done hook is called after compilation)
    compiler.hooks.done.tapAsync(
      this.pluginName,
      (_stats: any, callback: any) => {
        this.output.end();
        callback();
      },
    );

    // writeBundle hook - upload data after build is complete
    compiler.hooks.done.tapAsync(
      `${this.pluginName}-upload`,
      async (_stats: any, callback: any) => {
        try {
          await this.output.write();
        } catch (error) {
          console.error(
            `[${this.pluginName}] Failed to upload bundle analysis:`,
            error,
          );
        }
        callback();
      },
    );

    // Main analysis hook
    compiler.hooks.thisCompilation.tap(this.pluginName, (compilation: any) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.pluginName,
          stage: rspack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        async () => {
          this.output.setBundleName(this.output.originalBundleName);

          // Rspack base chunk format options: https://rspack.dev/config/output/#outputchunkformat
          if (typeof compilation.outputOptions.chunkFormat === "string") {
            if (compilation.name && compilation.name !== "") {
              this.output.setBundleName(
                `${this.output.bundleName}-${compilation.name}`,
              );
            }

            let chunkFormat = compilation.outputOptions.chunkFormat;
            if (chunkFormat === "commonjs") {
              chunkFormat = "cjs";
            } else if (chunkFormat === "module") {
              chunkFormat = "esm";
            }

            this.output.setBundleName(
              `${this.output.bundleName}-${chunkFormat}`,
            );
          }

          const compilationStats = compilation.getStats().toJson({
            assets: true,
            chunks: true,
            modules: true,
            builtAt: true,
            hash: true,
          });

          this.output.bundler = {
            name: "rspack",
            version: rspack.version,
          };

          const outputOptions = compilation.outputOptions;
          const { assets, chunks, modules } = compilationStats;

          if (assets) {
            const collectedAssets = await processAssets({
              assets,
              compilation,
              metaFramework: this.output.metaFramework,
            });

            this.output.assets = collectedAssets;
          }

          // need to collect all possible chunk ids beforehand
          // this collection is done in the processChunks function
          const chunkIdMap = new Map<number | string, string>();
          if (chunks) {
            this.output.chunks = processChunks({ chunks, chunkIdMap });
          }

          if (modules) {
            this.output.modules = processModules({ modules, chunkIdMap });
          }

          this.output.duration = Date.now() - (this.output.builtAt ?? 0);
          this.output.outputPath = outputOptions.path ?? "";

          // only output file if running dry run
          if (this.output.dryRun) {
            const { RawSource } = rspack.sources;
            compilation.emitAsset(
              `${this.output.bundleName}-stats.json`,
              new RawSource(this.output.bundleStatsToJson()),
            );
          }
        },
      );
    });
  }
}

export const rspackBundleAnalysisPlugin = (
  args: RspackBundleAnalysisPluginArgs,
) => {
  return new RspackBundleAnalysisPlugin(args);
};

export { RspackBundleAnalysisPlugin };
export type { RspackBundleAnalysisPluginArgs };
