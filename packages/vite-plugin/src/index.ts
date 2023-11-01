import { type PluginOption } from "vite";
import path from "node:path";

export interface Asset {
  name: string;
  size: number;
}

export interface Chunk {
  id: string;
  entry: boolean;
  initial: boolean;
  files: string[];
  names: string[];
}

export interface Module {
  name: string;
  size?: number;
  chunks: (string | number)[];
}

export interface BundleTransformOptions {
  fileName?: string;
  moduleOriginalSize?: boolean;
}

export const viteStatsPlugin = (
  customOptions: BundleTransformOptions = {},
): PluginOption => ({
  name: "vite-stats-plugin",
  generateBundle(_, bundle) {
    const options = {
      moduleOriginalSize: false,
      ...customOptions,
    };

    const assets: Asset[] = [];
    const chunks: Chunk[] = [];
    const moduleByFileName = new Map<string, Module>();
    const items = Object.values(bundle);

    const cwd = process.cwd();

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
          const size = item?.source.byteLength;

          assets.push({
            name: fileName,
            size: size,
          });
        }
      }

      if (item?.type === "chunk") {
        const chunkId = item?.name;
        const fileName = item?.fileName ?? "";
        const moduleEntries = Object.entries(item?.modules ?? {});
        const size = Buffer.from(item?.code).byteLength;

        assets.push({
          name: fileName,
          size: size,
        });

        chunks.push({
          id: chunkId,
          entry: item?.isEntry,
          initial: item?.isDynamicEntry,
          files: [item?.fileName],
          names: [item?.name],
        });

        for (const [modulePath, moduleInfo] of moduleEntries) {
          const normalizedModulePath = modulePath.replace("\u0000", "");
          const relativeModulePath = path.relative(cwd, normalizedModulePath);
          const relativeModulePathWithPrefix = relativeModulePath.match(/^\.\./)
            ? relativeModulePath
            : `.${path.sep}${relativeModulePath}`;

          const moduleEntry = moduleByFileName.get(
            relativeModulePathWithPrefix,
          );

          if (moduleEntry) {
            moduleEntry.chunks.push(chunkId);
          } else {
            const size = options.moduleOriginalSize
              ? moduleInfo.originalLength
              : moduleInfo.renderedLength;

            moduleByFileName.set(relativeModulePathWithPrefix, {
              name: relativeModulePathWithPrefix,
              size: size,
              chunks: [chunkId],
            });
          }
        }
      }
    }

    const modules = Object.values(
      Object.fromEntries(moduleByFileName.entries()),
    );

    const output = {
      testing: 123,
      builtAt: Date.now(),
      assets,
      chunks,
      modules,
    };

    this.emitFile({
      type: "asset",
      fileName: options?.fileName ?? "stats.json",
      source: JSON.stringify(output),
    });
  },
});
