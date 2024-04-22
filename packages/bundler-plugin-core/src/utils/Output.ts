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

class Output {
  userOptions: NormalizedOptions;
  internalOptions: InternalOptions;
  bundleName?: string;
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
  plugin?: {
    name: string;
    version: string;
  };

  constructor(userOptions: NormalizedOptions) {
    this.version = "1";
    this.userOptions = userOptions;
    this.internalOptions = {
      frozenBundleName: false,
      frozenPluginDetails: false,
    };
  }

  start(pluginName: string, pluginVersion: string) {
    this.builtAt = Date.now();

    if (!this.internalOptions.frozenPluginDetails) {
      this.plugin = {
        name: pluginName,
        version: pluginVersion,
      };
    }
  }

  end() {
    this.duration = Date.now() - (this.builtAt ?? 0);
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
        bundleName: this.userOptions.bundleName,
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
