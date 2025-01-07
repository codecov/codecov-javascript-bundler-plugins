import { type Client, type Scope, startSpan } from "@sentry/core";
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
import { safeFlushTelemetry } from "../sentry/telemetry.ts";

interface SentryConfig {
  sentryClient?: Client;
  sentryScope?: Scope;
}

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
  telemetry: boolean;
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
  sentryClient?: Client;
  sentryScope?: Scope;

  constructor(userOptions: NormalizedOptions, sentryConfig?: SentryConfig) {
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
    this.telemetry = userOptions.telemetry;
    this.sentryClient = sentryConfig?.sentryClient;
    this.sentryScope = sentryConfig?.sentryScope;

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
    try {
      return await startSpan(
        {
          name: "Output Write",
          op: "output.write",
          scope: this.sentryScope,
          forceTransaction: true,
        },
        async (outputWriteSpan) => {
          const provider = await startSpan(
            {
              name: "Detect Provider",
              op: "output.write.detectProvider",
              scope: this.sentryScope,
              parentSpan: outputWriteSpan,
            },
            async () => {
              let detectedProvider;
              try {
                detectedProvider = await detectProvider(inputs, this);
              } catch (error) {
                if (this.sentryClient && this.sentryScope) {
                  this.sentryScope.addBreadcrumb({
                    category: "output.write.detectProvider",
                    level: "error",
                    data: { error },
                  });
                  // this is being set as info because this could be caused by user error
                  this.sentryClient.captureMessage(
                    "Error in detectProvider",
                    "info",
                    undefined,
                    this.sentryScope,
                  );
                  await safeFlushTelemetry(this.sentryClient);
                }

                if (emitError) {
                  throw error;
                }

                debug(`Error getting provider: "${error}"`, {
                  enabled: this.debug,
                });
                return;
              }

              return detectedProvider;
            },
          );

          // early return if no provider
          if (!provider) return;

          if (this.sentryScope) {
            this.sentryScope.setTag("service", provider.service);

            const slug = provider.slug ?? "";
            const repoIndex = slug.lastIndexOf("/") + 1;
            // -1 to trim the trailing slash
            const owner = slug.substring(0, repoIndex - 1).trimEnd();
            if (owner.length > 0) {
              this.sentryScope.setTag("owner", owner);
            }

            const repo = slug.substring(repoIndex, slug.length);
            if (repo.length > 0) {
              this.sentryScope.setTag("repo", repo);
            }
          }

          const presignedURL = await startSpan(
            {
              name: "Get Pre-Signed URL",
              op: "output.write.getPreSignedURL",
              scope: this.sentryScope,
              parentSpan: outputWriteSpan,
            },
            async () => {
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
                if (this.sentryClient && this.sentryScope) {
                  this.sentryScope.addBreadcrumb({
                    category: "output.write.getPreSignedURL",
                    level: "error",
                    data: { error },
                  });
                  // only setting this as info because this could be caused by user error
                  this.sentryClient.captureMessage(
                    "Error in getPreSignedURL",
                    "info",
                    undefined,
                    this.sentryScope,
                  );
                  await safeFlushTelemetry(this.sentryClient);
                }

                if (emitError) {
                  throw error;
                }

                debug(`Error getting pre-signed URL: "${error}"`, {
                  enabled: this.debug,
                });
                return;
              }

              return url;
            },
          );

          // early return if no url
          if (!presignedURL || presignedURL === "") return;

          await startSpan(
            {
              name: "Upload Stats",
              op: "output.write.uploadStats",
              scope: this.sentryScope,
              parentSpan: outputWriteSpan,
            },
            async () => {
              try {
                await uploadStats({
                  preSignedUrl: presignedURL,
                  bundleName: this.bundleName,
                  message: this.bundleStatsToJson(),
                  retryCount: this?.retryCount,
                });
              } catch (error) {
                // this is being set as an error because this could not be caused by a user error
                if (this.sentryClient && this.sentryScope) {
                  this.sentryScope.addBreadcrumb({
                    category: "output.write.uploadStats",
                    level: "error",
                    data: { error },
                  });
                  this.sentryClient.captureMessage(
                    "Error in uploadStats",
                    "error",
                    undefined,
                    this.sentryScope,
                  );
                  await safeFlushTelemetry(this.sentryClient);
                }

                if (emitError) {
                  throw error;
                }

                debug(`Error uploading stats: "${error}"`, {
                  enabled: this.debug,
                });
                return;
              }
            },
          );

          if (this.sentryClient) {
            await safeFlushTelemetry(this.sentryClient);
          }

          return;
        },
      );
    } catch (error) {
      throw error;
    }
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
