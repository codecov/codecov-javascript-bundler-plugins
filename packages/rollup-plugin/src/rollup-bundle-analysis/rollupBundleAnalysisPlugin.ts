import path from "node:path";
import {
  type Asset,
  type Chunk,
  type Module,
  type BundleAnalysisUploadPlugin,
  red,
  createRollupAsset,
} from "@codecov/bundler-plugin-core";

export const rollupBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  pluginName,
  pluginVersion,
}) => ({
  version: output.version,
  name: pluginName,
  pluginVersion,
  buildStart: () => {
    output.start();
    output.setPlugin(pluginName, pluginVersion);
  },
  buildEnd: () => {
    output.end();
  },
  writeBundle: async () => {
    await output.write();
  },
  rollup: {
    async generateBundle(this, options, bundle) {
      // TODO - remove this once we hard fail on not having a bundle name
      // don't need to do anything if the bundle name is not present or empty
      if (!output.bundleName || output.bundleName === "") {
        red("Bundle name is not present or empty. Skipping upload.");
        return;
      }

      output.setBundleName(output.originalBundleName);
      if (options.name && options.name !== "") {
        output.setBundleName(`${output.bundleName}-${options.name}`);
      }

      const format = options.format === "es" ? "esm" : options.format;
      // append bundle output format to bundle name
      output.setBundleName(`${output.bundleName}-${format}`);

      const cwd = process.cwd();
      const assets: Asset[] = [];
      const chunks: Chunk[] = [];
      const moduleByFileName = new Map<string, Module>();
      const items = Object.values(bundle);
      const customOptions = {
        moduleOriginalSize: false,
        ...options,
      };

      let assetFormatString = "";
      if (typeof customOptions.assetFileNames === "string") {
        assetFormatString = customOptions.assetFileNames;
      }

      let chunkFormatString = "";
      if (typeof customOptions.chunkFileNames === "string") {
        chunkFormatString = customOptions.chunkFileNames;
      }

      let counter = 0;
      await Promise.all(
        items.map(async (item) => {
          if (item?.type === "asset") {
            const fileName = item?.fileName ?? "";
            if (path.extname(fileName) === ".map") {
              return;
            }

            const asset = await createRollupAsset({
              fileName: fileName,
              source: item.source,
              formatString: assetFormatString,
              metaFramework: output.metaFramework,
            });
            assets.push(asset);
          } else if (item?.type === "chunk") {
            const fileName = item?.fileName ?? "";
            if (path.extname(fileName) === ".map") {
              return;
            }

            const asset = await createRollupAsset({
              fileName,
              source: item.code,
              formatString: chunkFormatString,
              metaFramework: output.metaFramework,
            });
            assets.push(asset);

            const chunkId = item?.name ?? "";
            const uniqueId = `${counter}-${chunkId}`;

            chunks.push({
              id: chunkId,
              uniqueId: uniqueId,
              entry: item?.isEntry,
              initial: item?.isDynamicEntry,
              files: [fileName],
              names: [item?.name],
              dynamicImports: item?.dynamicImports ?? [],
            });

            const moduleEntries = Object.entries(item?.modules ?? {});
            for (const [modulePath, moduleInfo] of moduleEntries) {
              const normalizedModulePath = modulePath.replace("\u0000", "");
              const relativeModulePath = path.relative(
                cwd,
                normalizedModulePath,
              );
              const relativeModulePathWithPrefix = relativeModulePath.match(
                /^\.\./,
              )
                ? relativeModulePath
                : `.${path.sep}${relativeModulePath}`;

              // try to grab module already set in map
              const moduleEntry = moduleByFileName.get(
                relativeModulePathWithPrefix,
              );

              // if the modules exists append chunk ids to the grabbed module
              // else create a new module and create a new entry in the map
              if (moduleEntry) {
                moduleEntry.chunkUniqueIds.push(uniqueId);
              } else {
                const size = customOptions.moduleOriginalSize
                  ? moduleInfo.originalLength
                  : moduleInfo.renderedLength;

                const module: Module = {
                  name: relativeModulePathWithPrefix,
                  size: size,
                  chunkUniqueIds: [uniqueId],
                };

                moduleByFileName.set(relativeModulePathWithPrefix, module);
              }
            }
            counter += 1;
          }

          return;
        }),
      );

      // grab the modules from the map and convert it to an array
      const modules = Array.from(moduleByFileName.values());

      output.bundler = {
        name: "rollup",
        version: this.meta.rollupVersion,
      };
      output.assets = assets;
      output.chunks = chunks;
      output.modules = modules;
      output.outputPath = options.dir ?? "";

      // only output file if running dry run
      if (output.dryRun) {
        this.emitFile({
          type: "asset",
          fileName: `${output.bundleName}-stats.json`,
          source: output.bundleStatsToJson(),
        });
      }
    },
  },
});
