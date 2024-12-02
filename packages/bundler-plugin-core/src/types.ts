import { type UnpluginOptions } from "unplugin";
import { type Output } from "./utils/Output";
import { type ValidGitService } from "./utils/normalizeOptions";

export interface Dependency {
  name: string;
  version: string;
}

export interface Asset {
  name: string;
  size: number;
  gzipSize: number | null;
  normalized: string;
}

export interface Chunk {
  id: string;
  uniqueId: string;
  entry: boolean;
  initial: boolean;
  names: string[];
  files: string[];
  dynamicImports: string[];
}

export interface Module {
  name: string;
  size?: number;
  chunkUniqueIds: string[];
}

export interface OutputPayload {
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
}

export interface ExtendedBAUploadArgs<TArgs extends object>
  extends BundleAnalysisUploadPluginArgs {
  options: TArgs;
}

/** Configuration options for the Codecov bundler plugin. */
export interface Options {
  /**
   * The api url used to fetch the upload url.
   *
   * Only required if self-hosting codecov.
   *
   * Example: `apiUrl: 'https://api.codecov.io'`
   *
   * Defaults to `https://api.codecov.io`.
   */
  apiUrl?: string;

  /**
   * Override value for git service used for tokenless uploads. Using tokenless uploads is only
   * supported for public repositories.
   *
   * Note: If an `uploadToken` is provided you do not need to provide a `gitService`.
   *
   * The value must be one of the following:
   * - `github`
   * - `gitlab`
   * - `bitbucket`
   * - `github_enterprise`
   * - `gitlab_enterprise`
   * - `bitbucket_server`
   *
   * Example `gitService: 'github'`
   */
  gitService?: ValidGitService;

  /**
   * The upload token to use for uploading the bundle analysis information.
   *
   * This field is **required** for uploading bundle analysis information in private repositories.
   * Alternatively if you're using GitHub Actions and have configured OIDC authentication you can
   * omit this field, and enable the `oidc.useGitHubOIDC` option.
   *
   * This value can either be a global upload token or a repo token.
   * - The global upload token can be found under the organization settings page.
   * - The repo token can be found under the repo settings page under the general tab.
   */
  uploadToken?: string;

  /**
   * The amount of times the upload function will retry to upload bundle analysis information.
   *
   * Defaults to `3`
   */
  retryCount?: number;

  /**
   * The name for the bundle being built.
   *
   * Required for uploading bundle analysis information.
   *
   * The name must match the pattern `/^[\w\d_:/@\.{}\[\]$-]+$/`.
   *
   * Example: `bundleName: '@codecov/rollup-plugin'`
   */
  bundleName?: string;

  /**
   * Whether you would like bundle analysis to be enabled. *
   *
   * Example: `enableBundleAnalysis: true`
   *
   * Defaults to `false`
   */
  enableBundleAnalysis?: boolean;

  /** Override values for passing custom information to API. */
  uploadOverrides?: UploadOverrides;

  /** Option to enable debug logs for the plugin. */
  debug?: boolean;

  /**
   * When enabled information will not be uploaded to Codecov.
   *
   * Example: `dryRun: true`
   *
   * Defaults to `false`
   */
  dryRun?: boolean;

  /** Options for OIDC authentication. */
  oidc?: {
    /**
     * When using GitHub Actions this option can be enabled to use OIDC authentication, which
     * removes the requirement for an upload token.
     *
     * [OpenID Connect
     * (OIDC)](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
     * is **required** to be configured in order to use GitHub OIDC.
     *
     * Defaults to `false`
     */
    useGitHubOIDC: boolean;

    /**
     * The OIDC audience to use for authentication.
     *
     * If you're using a self hosted version of Codecov, you will need to provide the audience for
     * the OIDC token.
     *
     * Defaults to `https://codecov.io`
     */
    gitHubOIDCTokenAudience?: string;
  };
}

export type BundleAnalysisUploadPlugin = (
  args: BundleAnalysisUploadPluginArgs,
) => UnpluginOptions & {
  pluginVersion: string;
  version: string;
};

export type ExtendedBAUploadPlugin<TArgs extends object> = (
  args: ExtendedBAUploadArgs<TArgs>,
) => UnpluginOptions & {
  pluginVersion: string;
  version: string;
};

/** A set of overrides that are passed to Codecov. */
export interface UploadOverrides {
  /** Specify the branch manually. */
  branch?: string;
  /** Specify the build number manually. */
  build?: string;
  /** Specify the compare SHA manually. **GH Actions only**. */
  compareSha?: string;
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
  detect: (envs: ProviderEnvs) => boolean;
  getServiceName: () => string;
  getServiceParams: (
    inputs: ProviderUtilInputs,
    output: Output,
  ) => Promise<ProviderServiceParams>;
  getEnvVarNames: () => string[];
}

export interface ProviderServiceParams {
  branch: string | null;
  build: string | null;
  buildURL: string | null;
  commit: string | null;
  // this is a custom field that is only used for GH pre-merge commits
  compareSha?: string | null;
  job: string | null;
  pr: string | null;
  service: string | null;
  slug: string | null;
}
