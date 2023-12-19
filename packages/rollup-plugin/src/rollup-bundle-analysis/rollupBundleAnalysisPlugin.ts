import path from "node:path";
import {
  type Asset,
  type Chunk,
  type Module,
  type BundleAnalysisUploadPlugin,
  red,
} from "@codecov/bundler-plugin-core";

const PLUGIN_NAME = "codecov-rollup-bundle-analysis-plugin";

export const rollupBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  userOptions,
}) => ({
  version: "1",
  name: PLUGIN_NAME,
  pluginVersion: "1.0.0",
  rollup: {
    generateBundle(this, options, bundle) {
      // don't need to do anything if the bundle name is not present or empty
      if (!userOptions.bundleName || userOptions.bundleName === "") {
        red("Bundle name is not present or empty. Skipping upload.");
        return;
      }

      // append bundle output format to bundle name
      output.bundleName = `${userOptions.bundleName}-${options.format}`;

      if (options.name && options.name !== "") {
        output.bundleName = `${userOptions.bundleName}-${options.name}`;
      }

      const customOptions = {
        moduleOriginalSize: false,
        ...options,
      };

      const assets: Asset[] = [];
      const chunks: Chunk[] = [];
      const moduleByFileName = new Map<string, Module>();
      const items = Object.values(bundle);

      const cwd = process.cwd();

      let counter = 0;
      for (const item of items) {
        if (item?.type === "asset") {
          if (typeof item.source === "string") {
            const fileName = item?.fileName ?? "";
            const size = Buffer.from(item.source).byteLength;

            assets.push({
              name: fileName,
              size: size,
            });
          } else {
            const fileName = item?.fileName ?? "";
            const size = item?.source?.byteLength;

            assets.push({
              name: fileName,
              size: size,
            });
          }
        }

        if (item?.type === "chunk") {
          const chunkId = item?.name ?? "";
          const fileName = item?.fileName ?? "";
          const moduleEntries = Object.entries(item?.modules ?? {});
          const size = item?.code?.length;
          const uniqueId = `${counter}-${chunkId}`;

          assets.push({
            name: fileName,
            size: size,
          });

          chunks.push({
            id: chunkId,
            uniqueId: uniqueId,
            entry: item?.isEntry,
            initial: item?.isDynamicEntry,
            files: [item?.fileName],
            names: [item?.name],
          });

          for (const [modulePath, moduleInfo] of moduleEntries) {
            const normalizedModulePath = modulePath.replace("\u0000", "");
            const relativeModulePath = path.relative(cwd, normalizedModulePath);
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
              moduleEntry.chunks.push(chunkId);
              moduleEntry.chunkUniqueIds.push(uniqueId);
            } else {
              const size = customOptions.moduleOriginalSize
                ? moduleInfo.originalLength
                : moduleInfo.renderedLength;

              const module = {
                name: relativeModulePathWithPrefix,
                size: size,
                chunks: [chunkId],
                chunkUniqueIds: [uniqueId],
              };

              moduleByFileName.set(relativeModulePathWithPrefix, module);
            }
          }
          counter += 1;
        }
      }

      // grab the modules from the map and convert it to an array
      const modules = Array.from(moduleByFileName.values());

      output.bundler = {
        name: "rollup",
        version: this.meta.rollupVersion,
      };
      output.assets = assets;
      output.chunks = chunks;
      output.modules = modules;

      // only output file if running dry run
      if (userOptions?.dryRun) {
        this.emitFile({
          type: "asset",
          fileName: "codecov-bundle-stats.json",
          source: JSON.stringify(output),
        });
      }
    },
  },
});
