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

class Output {
  // base user options
  apiUrl: string;
  dryRun: boolean;
  retryCount: number;
  enableBundleAnalysis: boolean;
  uploadToken?: string;
  debug: boolean;
  originalBundleName: string;
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
    this.version = "2";
    this.apiUrl = userOptions.apiUrl;
    this.dryRun = userOptions.dryRun;
    this.retryCount = userOptions.retryCount;
    this.enableBundleAnalysis = userOptions.enableBundleAnalysis;
    this.uploadToken = userOptions.uploadToken;
    this.debug = userOptions.debug;
    this.originalBundleName = userOptions.bundleName;

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

  async write() {
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
        apiURL: this?.apiUrl ?? "https://api.codecov.io",
        uploadToken: this?.uploadToken,
        serviceParams: provider,
        retryCount: this?.retryCount,
      });
    } catch (error) {
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
