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
  /**
   * The upload token to use for uploading the bundle analysis information.
   *
   * `globalUploadToken` and `repoName` must be set if this is not set.
   */
  globalUploadToken?: string;

  /**
   * The name of the repository to upload the bundle analysis information to.
   *
   * `globalUploadToken` and `repoName` must be set if this is not set.
   */
  repoName?: string;

  /**
   * The upload token to use for uploading the bundle analysis information.
   *
   * Mutually exclusive to using `globalUploadToken` and `repoName`.
   */
  repoToken?: string;

  /**
   * The commit hash to use for uploading the bundle analysis information.
   *
   * Defaults package.json name field.
   */
  namespace?: string;

  // TODO: Update the default value here
  /**
   * The api url used to fetch the upload url.
   *
   * Only required if self-hosting codecov.
   *
   * Defaults to 'https://api.codecov.io'.
   */
  apiUrl?: string;

  // not 100% sure we want this, if we're just uploading the files directly
  // I guess if this is set then we can also emit a json file with the stats
  statsFileName?: string;

  /** Whether you would like bundle analysis to be enabled. */
  enableBundleAnalysis?: boolean;

  /** Override values for passing custom information to API. */
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
