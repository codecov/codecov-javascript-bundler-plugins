import { type UnpluginOptions } from "unplugin";

export interface Dependency {
  name: string;
  version: string;
}

export interface Asset {
  name: string;
  size: number;
  normalized: string;
}

export interface Chunk {
  id: string;
  uniqueId: string;
  entry: boolean;
  initial: boolean;
  names: string[];
  files: string[];
}

export interface Module {
  name: string;
  size?: number;
  chunkUniqueIds: string[];
}

export interface Output {
  version?: string;
  bundleName: string;
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
  userOptions: Options;
}

export interface Options {
  /**
   * The upload token to use for uploading the bundle analysis information.
   *
   * This value can either be an global upload token or a repo token.
   * - The global upload token can be found under the organization settings page.
   * - The repo token can be found under the repo settings page under the general tab.
   */
  uploadToken?: string;

  /**
   * The api url used to fetch the upload url.
   *
   * Only required if self-hosting codecov.
   *
   * Defaults to `https://api.codecov.io`.
   */
  apiUrl?: string;

  /**
   * The amount of times the upload function will retry to upload bundle analysis information.
   *
   * Defaults to `3`
   */
  retryCount?: number;

  /** Whether you would like bundle analysis to be enabled. */
  enableBundleAnalysis?: boolean;

  /** Override values for passing custom information to API. */
  uploadOverrides?: UploadOverrides;

  /**
   * When enabled information will not be uploaded to Codecov.
   *
   * Defaults to `false`
   */
  dryRun?: boolean;

  /**
   * The name for the bundle being built.
   *
   * Required for uploading bundle analysis information.
   *
   * Example: `rollup-package`
   */
  bundleName?: string;

  /** Only send bundle stats to sentry (used within sentry webpack plugin). */
  sentryOnly?: boolean;

  /** The token to use for uploading the bundle analysis information to sentry. */
  sentryAuthToken?: string;

  /** The name of the sentry organization to send webpack stats to. */
  sentryOrganization?: string;

  /** The name of the sentry project to send webpack stats to. */
  sentryProject?: string;
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
  /** Specify the pull request number manually. */
  pr?: string;
  /** Specify the commit SHA manually. */
  sha?: string;
  /** Specify the slug manually. */
  slug?: string;
}

export type ProviderEnvs = NodeJS.Dict<string>;

export interface ProviderUtilInputs {
  envs: ProviderEnvs;
  args: Options["uploadOverrides"];
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
}
