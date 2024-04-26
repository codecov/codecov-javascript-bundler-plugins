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

interface InternalOptions {
  frozenBundleName: boolean;
  frozenPluginDetails: boolean;
}

interface SetPluginOptions {
  frozen?: boolean;
}

interface SetBundleNameOptions {
  frozen?: boolean;
}

class Output {
  // base user options
  apiUrl: string;
  dryRun: boolean;
  retryCount: number;
  enableBundleAnalysis: boolean;
  uploadToken?: string;
  debug: boolean;
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
  #internalOptions: InternalOptions = {
    frozenBundleName: false,
    frozenPluginDetails: false,
  };

  constructor(userOptions: NormalizedOptions) {
    this.version = "1";
    this.apiUrl = userOptions.apiUrl;
    this.dryRun = userOptions.dryRun;
    this.retryCount = userOptions.retryCount;
    this.enableBundleAnalysis = userOptions.enableBundleAnalysis;
    this.uploadToken = userOptions.uploadToken;
    this.debug = userOptions.debug;

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

  setBundleName(bundleName: string, options: SetPluginOptions = {}) {
    // if set to false, unfreeze the plugin details
    if (typeof options.frozen === "boolean" && !options.frozen) {
      this.#internalOptions.frozenBundleName = options.frozen;
    }

    if (!this.#internalOptions.frozenBundleName) {
      this.#internalBundleName = bundleName;
    }

    // lock back up if frozen is set to true
    if (typeof options.frozen === "boolean" && options.frozen) {
      this.#internalOptions.frozenBundleName = options.frozen;
    }

    return this.#internalBundleName;
  }

  get bundleName() {
    return this.#internalBundleName;
  }

  setPlugin(
    pluginName: string,
    pluginVersion: string,
    options?: SetBundleNameOptions,
  ) {
    // if set to false, unfreeze the plugin details
    if (typeof options?.frozen === "boolean" && !options.frozen) {
      this.#internalOptions.frozenPluginDetails = options?.frozen;
    }

    if (!this.#internalOptions.frozenPluginDetails) {
      this.#internalPlugin = {
        name: pluginName,
        version: pluginVersion,
      };
    }

    // lock back up if frozen is set to true
    if (typeof options?.frozen === "boolean" && options.frozen) {
      this.#internalOptions.frozenPluginDetails = options?.frozen;
    }

    return this.#internalPlugin;
  }

  get plugin() {
    return this.#internalPlugin;
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
    const provider = await detectProvider(inputs);

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
