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
  userOptions: NormalizedOptions;
  #internalOptions: InternalOptions = {
    frozenBundleName: false,
    frozenPluginDetails: false,
  };
  #internalBundleName: string;
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
  #internalPlugin?: {
    name: string;
    version: string;
  };

  constructor(userOptions: NormalizedOptions) {
    this.version = "1";
    this.userOptions = userOptions;
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
    if (this.userOptions.dryRun) return;

    if (!this.userOptions.bundleName || this.userOptions.bundleName === "")
      return;

    const args: UploadOverrides = this.userOptions.uploadOverrides ?? {};
    const envs = process.env;
    const inputs: ProviderUtilInputs = { envs, args };
    const provider = await detectProvider(inputs);

    let url = "";
    try {
      url = await getPreSignedURL({
        apiURL: this.userOptions?.apiUrl ?? "https://api.codecov.io",
        uploadToken: this.userOptions?.uploadToken,
        serviceParams: provider,
        retryCount: this.userOptions?.retryCount,
      });
    } catch (error) {
      return;
    }

    try {
      await uploadStats({
        preSignedUrl: url,
        bundleName: this.bundleName,
        message: this.formatPayload(),
        retryCount: this.userOptions?.retryCount,
      });
    } catch (error) {
      return;
    }

    return;
  }

  formatPayload() {
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
