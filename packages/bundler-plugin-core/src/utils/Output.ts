import {
  type Asset,
  type Chunk,
  type Module,
  type OutputPayload,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "../types.ts";
import { getPreSignedURL } from "./getPreSignedURL.ts";
import { type NormalizedOptions } from "./normalizeOptions.ts";
import { detectProvider } from "./provider.ts";
import { uploadStats } from "./uploadStats.ts";
import { type ValidGitService } from "./normalizeOptions";
import { debug } from "./logging.ts";

class Output {
  // base user options
  apiUrl: string;
  dryRun: boolean;
  retryCount: number;
  enableBundleAnalysis: boolean;
  uploadToken?: string;
  oidc?: {
    useGitHubOIDC: boolean;
    gitHubOIDCTokenAudience: string;
  };
  debug: boolean;
  gitService?: ValidGitService;
  #internalOriginalBundleName: string;
  // uploader overrides
  branch?: string;
  build?: string;
  pr?: string;
  sha?: string;
  slug?: string;
  // bundle analysis properties
  version: string;
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
  // internal options/properties
  #internalBundleName: string;
  #internalPlugin?: {
    name: string;
    version: string;
  };
  #internalLocks = {
    bundleName: false,
    pluginDetails: false,
  };

  constructor(userOptions: NormalizedOptions) {
    this.version = "3";
    this.apiUrl = userOptions.apiUrl;
    this.dryRun = userOptions.dryRun;
    this.retryCount = userOptions.retryCount;
    this.enableBundleAnalysis = userOptions.enableBundleAnalysis;
    this.uploadToken = userOptions.uploadToken;
    this.debug = userOptions.debug;
    this.gitService = userOptions.gitService;
    this.#internalOriginalBundleName = userOptions.bundleName;
    this.oidc = userOptions.oidc;

    if (userOptions.uploadOverrides) {
      this.branch = userOptions.uploadOverrides.branch;
      this.build = userOptions.uploadOverrides.build;
      this.pr = userOptions.uploadOverrides.pr;
      this.sha = userOptions.uploadOverrides.sha;
      this.slug = userOptions.uploadOverrides.slug;
    }

    this.#internalBundleName = userOptions.bundleName;
  }

  start() {
    this.builtAt = Date.now();
  }

  end() {
    this.duration = Date.now() - (this.builtAt ?? 0);
  }

  lockBundleName() {
    this.#internalLocks.bundleName = true;
  }

  unlockBundleName() {
    this.#internalLocks.bundleName = false;
  }

  setBundleName(bundleName: string) {
    if (!this.#internalLocks.bundleName) {
      this.#internalBundleName = bundleName;
    }

    return this.#internalBundleName;
  }

  get bundleName() {
    return this.#internalBundleName;
  }

  get originalBundleName() {
    return this.#internalOriginalBundleName;
  }

  setPlugin(pluginName: string, pluginVersion: string) {
    if (!this.#internalLocks.pluginDetails) {
      this.#internalPlugin = {
        name: pluginName,
        version: pluginVersion,
      };
    }

    return this.#internalPlugin;
  }

  get plugin() {
    return this.#internalPlugin;
  }

  lockPluginDetails() {
    this.#internalLocks.pluginDetails = true;
  }

  unlockPluginDetails() {
    this.#internalLocks.pluginDetails = false;
  }

  async write(emitError?: boolean) {
    if (this.dryRun) return;

    if (!this.bundleName || this.bundleName === "") return;

    const args: UploadOverrides = {
      branch: this.branch,
      build: this.build,
      pr: this.pr,
      sha: this.sha,
      slug: this.slug,
    };
    const envs = process.env;
    const inputs: ProviderUtilInputs = { envs, args };
    const provider = await detectProvider(inputs, this);

    let url = "";
    try {
      url = await getPreSignedURL({
        apiUrl: this.apiUrl,
        uploadToken: this.uploadToken,
        gitService: this.gitService,
        oidc: this.oidc,
        retryCount: this.retryCount,
        serviceParams: provider,
      });
    } catch (error) {
      if (emitError) {
        throw error;
      }

      debug(`Error getting pre-signed URL: "${error}"`, {
        enabled: this.debug,
      });
      return;
    }

    try {
      await uploadStats({
        preSignedUrl: url,
        bundleName: this.bundleName,
        message: this.bundleStatsToJson(),
        retryCount: this?.retryCount,
      });
    } catch (error) {
      if (emitError) {
        throw error;
      }
      debug(`Error uploading stats: "${error}"`, { enabled: this.debug });
      return;
    }

    return;
  }

  bundleStatsToJson() {
    const payload: OutputPayload = {
      version: this.version,
      builtAt: this.builtAt,
      duration: this.duration,
      bundleName: this.bundleName ?? "",
      outputPath: this.outputPath,
      bundler: this.bundler,
      plugin: this.plugin,
      assets: this.assets,
      chunks: this.chunks,
      modules: this.modules,
    };

    return JSON.stringify(payload);
  }
}

export { Output };
