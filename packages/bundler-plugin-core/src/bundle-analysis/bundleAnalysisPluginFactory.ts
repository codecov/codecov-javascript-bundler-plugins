import {
  type BundleAnalysisUploadPlugin,
  type Output,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "../types.ts";
import { type UnpluginContextMeta, type UnpluginOptions } from "unplugin";
import { getPreSignedURL } from "../utils/getPreSignedURL.ts";
import { uploadStats } from "../utils/uploadStats.ts";
import { type SentryMetrics } from "../sentry.ts";
import { type NormalizedOptions } from "../utils/normalizeOptions.ts";
import { detectProvider } from "../utils/provider.ts";
import { sendSentryBundleStats } from "../utils/sentryUtils.ts";
import { createGauge } from "../utils/fetchWithRetry.ts";

interface BundleAnalysisUploadPluginArgs {
  options: NormalizedOptions;
  unpluginMetaContext: UnpluginContextMeta;
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
  sentryMetrics: SentryMetrics;
  handleRecoverableError: (error: unknown) => void;
}

export const bundleAnalysisPluginFactory = ({
  options,
  unpluginMetaContext,
  bundleAnalysisUploadPlugin,
  sentryMetrics,
  handleRecoverableError,
}: BundleAnalysisUploadPluginArgs): UnpluginOptions => {
  const output: Output = {
    version: "1",
    bundleName: options.bundleName,
  };

  const { pluginVersion, version, ...pluginOpts } = bundleAnalysisUploadPlugin({
    output,
    options,
  });

  output.version = version;
  output.plugin = {
    name: pluginOpts.name,
    version: pluginVersion,
  };

  return {
    ...pluginOpts,
    buildStart() {
      output.builtAt = Date.now();
    },
    buildEnd(this) {
      output.duration = Date.now() - (output.builtAt ?? 0);
    },
    writeBundle: async () => {
      // don't need to do anything here if dryRun is true
      if (options.dryRun) return;

      // don't need to do anything if the bundle name is not present or empty
      if (!options.bundleName || options.bundleName === "") return;

      if (options.sentry?.isEnabled) {
        try {
          await sendSentryBundleStats(output, options);
        } catch {}

        if (options?.sentry?.sentryOnly) {
          return;
        }
      }

      const args: UploadOverrides = options.uploadOverrides ?? {};
      const envs = process.env;
      const inputs: ProviderUtilInputs = { envs, args };
      const provider = await detectProvider(inputs);

      let url = "";
      const gauge = createGauge({
        bundler: unpluginMetaContext.framework,
        sentryMetrics,
      });
      const getPreSignedURLStart = Date.now();
      try {
        url = await getPreSignedURL({
          apiURL: options?.apiUrl,
          uploadToken: options?.uploadToken,
          serviceParams: provider,
          retryCount: options?.retryCount,
          gauge,
        });
        sentryMetrics?.increment("request_presigned_url.success", 1, "none", {
          bundler: unpluginMetaContext.framework,
        });
      } catch (error) {
        sentryMetrics?.increment("request_presigned_url.error", 1, "none", {
          bundler: unpluginMetaContext.framework,
        });

        handleRecoverableError(error);
        return;
      } finally {
        sentryMetrics?.distribution(
          "request_presigned_url",
          Date.now() - getPreSignedURLStart,
          "millisecond",
          { bundler: unpluginMetaContext.framework },
        );
      }

      const uploadStart = Date.now();
      try {
        await uploadStats({
          preSignedUrl: url,
          bundleName: output.bundleName,
          message: JSON.stringify(output),
          retryCount: options?.retryCount,
          gauge,
        });
        sentryMetrics?.increment("upload_bundle_stats.success", 1, "none", {
          bundler: unpluginMetaContext.framework,
        });
      } catch (error) {
        sentryMetrics?.increment("upload_bundle_stats.error", 1);
        handleRecoverableError(error);
        return;
      } finally {
        sentryMetrics?.distribution(
          "upload_bundle_stats",
          Date.now() - uploadStart,
          "millisecond",
          { bundler: unpluginMetaContext.framework },
        );
      }
    },
  };
};
