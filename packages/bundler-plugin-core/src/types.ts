import { type UnpluginOptions } from "unplugin";

export interface Dependency {
  name: string;
  version: string;
}

export interface Asset {
  name: string;
  size: number;
}

export interface Chunk {
  id: string;
  uniqueId: string;
  entry: boolean;
  initial: boolean;
  files: string[];
  names: string[];
}

export interface Module {
  name: string;
  size?: number;
  chunks: (string | number)[];
  chunkUniqueIds: string[];
}

export interface Output {
  version?: string;
  bundler?: {
    name: string;
    version: string;
  };
  outputPath?: string;
  builtAt?: number;
  duration?: number;
  assets?: Asset[];
  chunks?: Chunk[];
  modules?: Module[];
  plugin?: {
    name: string;
    version: string;
  };
}

export interface BundleAnalysisUploadPluginArgs {
  output: Output;
  statsFileName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Options {
  statsFileName?: string;
  enableBundleAnalysis?: boolean;
}

export type BundleAnalysisUploadPlugin = (
  args: BundleAnalysisUploadPluginArgs,
) => UnpluginOptions & {
  pluginVersion: string;
  version: string;
};
