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
  uploaderOverrides?: UploadOverrides;
}

export interface Options {
  statsFileName?: string;
  enableBundleAnalysis?: boolean;
  uploaderOverrides?: UploadOverrides;
}

export type BundleAnalysisUploadPlugin = (
  args: BundleAnalysisUploadPluginArgs,
) => UnpluginOptions & {
  pluginVersion: string;
  version: string;
};

export interface UploadOverrides {
  /** Specify the branch manually. */
  branch?: string;
  /** Specify the build number manually. */
  build?: string;
  /** The commit SHA of the parent for which you are uploading coverage. */
  parent?: string;
  /** Specify the pull request number manually. */
  pr?: string;
  /** Specify the commit SHA manually. */
  sha?: string;
  /** Specify the slug manually. */
  slug?: string;
  /** Specify the tag manually. */
  tag?: string;
  /** Change the upload host (Enterprise use). */
  url?: string;
}

export type ProviderEnvs = NodeJS.Dict<string>;

export interface ProviderUtilInputs {
  envs: ProviderEnvs;
  args: Options["uploaderOverrides"];
}

export interface ProviderUtil {
  detect: (arg0: ProviderEnvs) => boolean;
  getServiceName: () => string;
  getServiceParams: (
    arg0: ProviderUtilInputs,
  ) => Promise<ProviderServiceParams>;
  getEnvVarNames: () => string[];
}

export interface ProviderServiceParams {
  branch: string;
  build: string;
  buildURL: string;
  commit: string;
  job: string;
  pr: string;
  service: string;
  slug: string;
  name?: string;
  tag?: string;
  parent?: string;
  project?: string;
  server_uri?: string;
}
