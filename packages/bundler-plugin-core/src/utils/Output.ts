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
  options: NormalizedOptions;
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

  constructor(options: NormalizedOptions) {
    this.version = "1";
    this.options = options;
  }

  start(pluginName: string, pluginVersion: string) {
    this.builtAt = Date.now();
    this.plugin = {
      name: pluginName,
      version: pluginVersion,
    };
  }

  end() {
    this.duration = Date.now() - (this.builtAt ?? 0);
  }

  async write() {
    if (this.options.dryRun) return;

    if (!this.options.bundleName || this.options.bundleName === "") return;

    const args: UploadOverrides = this.options.uploadOverrides ?? {};
    const envs = process.env;
    const inputs: ProviderUtilInputs = { envs, args };
    const provider = await detectProvider(inputs);

    let url = "";
    try {
      url = await getPreSignedURL({
        apiURL: this.options?.apiUrl ?? "https://api.codecov.io",
        uploadToken: this.options?.uploadToken,
        serviceParams: provider,
        retryCount: this.options?.retryCount,
      });
    } catch (error) {
      return;
    }

    try {
      await uploadStats({
        preSignedUrl: url,
        bundleName: this.options.bundleName,
        message: this.formatPayload(),
        retryCount: this.options?.retryCount,
      });
    } catch {
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
