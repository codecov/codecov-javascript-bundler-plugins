import path from "node:path";
import {
  normalizePath,
  type Asset,
  type Chunk,
  type Module,
  type BundleAnalysisUploadPlugin,
  red,
  buildStartFactory,
  buildEndFactory,
  writeBundleFactory,
} from "@codecov/bundler-plugin-core";

const PLUGIN_NAME = "codecov-vite-bundle-analysis-plugin";

export const viteBundleAnalysisPlugin: BundleAnalysisUploadPlugin = ({
  output,
  options: userOptions,
}) => ({
  version: "1",
  name: PLUGIN_NAME,
  pluginVersion: "1.0.0",
  buildStart: () => {
    buildStartFactory(output);
  },
  buildEnd: () => {
    buildEndFactory(output);
  },
  writeBundle: async () => {
    await writeBundleFactory({ output, options: userOptions })();
  },
  vite: {
    generateBundle(this, options, bundle) {
      // don't need to do anything if the bundle name is not present or empty
      if (!userOptions.bundleName || userOptions.bundleName === "") {
        red("Bundle name is not present or empty. Skipping upload.");
        return;
      }

      const format = options.format === "es" ? "esm" : options.format;

      // append bundle output format to bundle name
      output.bundleName = `${userOptions.bundleName}-${format}`;

      // add in bundle name if present
      if (options.name && options.name !== "") {
        output.bundleName = `${userOptions.bundleName}-${options.name}`;
      }

      // handle nuxt
      if (options.dir?.includes("nuxt")) {
        if (options.dir?.includes("client")) {
          output.bundleName = `${output.bundleName}-client`;
        } else if (options.dir?.includes("server")) {
          output.bundleName = `${output.bundleName}-server`;
        }
      }

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
      for (const item of items) {
        if (item?.type === "asset") {
          if (typeof item.source === "string") {
            const fileName = item?.fileName ?? "";
            const size = Buffer.from(item.source).byteLength;

            if (path.extname(fileName) === ".map") {
              continue;
            }

            assets.push({
              name: fileName,
              size: size,
              normalized: normalizePath(fileName, assetFormatString),
            });
          } else {
            const fileName = item?.fileName ?? "";
            const size = item?.source.byteLength;

            if (path.extname(fileName) === ".map") {
              continue;
            }

            assets.push({
              name: fileName,
              size: size,
              normalized: normalizePath(fileName, assetFormatString),
            });
          }
        }

        if (item?.type === "chunk") {
          const chunkId = item?.name ?? "";
          const fileName = item?.fileName ?? "";
          const moduleEntries = Object.entries(item?.modules ?? {});
          const size = Buffer.from(item?.code).byteLength;
          const uniqueId = `${counter}-${chunkId}`;

          if (path.extname(fileName) === ".map") {
            continue;
          }

          assets.push({
            name: fileName,
            size: size,
            normalized: normalizePath(fileName, chunkFormatString),
          });

          chunks.push({
            id: chunkId,
            uniqueId: uniqueId,
            entry: item?.isEntry,
            initial: item?.isDynamicEntry,
            files: [fileName],
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
      output.outputPath = options.dir ?? "";

      // only output file if running dry run
      if (userOptions.dryRun) {
        this.emitFile({
          type: "asset",
          fileName: `${output.bundleName}-stats.json`,
          source: JSON.stringify(output),
        });
      }
    },
  },
});
