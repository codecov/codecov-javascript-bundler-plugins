import path from "node:path";
import {
  codecovUnpluginFactory,
  type Asset,
  type Chunk,
  type Module,
  type Options,
} from "@codecov/bundler-plugin-core";

export interface BundleTransformOptions {
  fileName?: string;
  moduleOriginalSize?: boolean;
}

const codecovUnplugin = codecovUnpluginFactory({
  bundleAnalysisUploadPlugin: ({ output }) => {
    return {
      version: "1",
      name: "codecov-rollup-bundle-analysis-plugin",
      pluginVersion: "1.0.0",
      rollup: {
        generateBundle(this, options, bundle) {
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

          // need to emit the file here as buildEnd is called before generateBundle
          this.emitFile({
            type: "asset",
            fileName: "codecov-bundle-stats.json",
            source: JSON.stringify(output),
          });
        },
      },
    };
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const codecovRollupPlugin: (options: Options) => any =
  codecovUnplugin.rollup;
