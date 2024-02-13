import { type UnpluginOptions } from "unplugin";
import {
  type BundleAnalysisUploadPlugin,
  type Output,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "../types.ts";
import { getPreSignedURL } from "../utils/getPreSignedURL.ts";
import { type NormalizedOptions } from "../utils/normalizeOptions.ts";
import { detectProvider } from "../utils/provider.ts";
import { uploadStats } from "../utils/uploadStats.ts";
import { sendSentryBundleStats } from "../utils/sentryUtils.ts";
import { type SentryClient } from "../sentry.ts";

interface BundleAnalysisUploadPluginArgs {
  options: NormalizedOptions;
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
  sentryClient: SentryClient;
}

export const bundleAnalysisPluginFactory = ({
  options,
  bundleAnalysisUploadPlugin,
  sentryClient,
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

      const getPreSignedURLStart = Date.now();
      let url = "";
      try {
        url = await getPreSignedURL({
          apiURL: options?.apiUrl,
          uploadToken: options?.uploadToken,
          serviceParams: provider,
          retryCount: options?.retryCount,
        });
        sentryClient?.metricsAggregator?.add(
          "c",
          "request_presigned_url.success",
          1,
        );
      } catch (error) {
        sentryClient?.metricsAggregator?.add(
          "c",
          "request_presigned_url.error",
          1,
        );
        return;
      } finally {
        sentryClient?.metricsAggregator?.add(
          "d",
          "request_presigned_url",
          Date.now() - getPreSignedURLStart,
          "millisecond",
        );
      }

      const uploadStart = Date.now();
      try {
        await uploadStats({
          preSignedUrl: url,
          bundleName: output.bundleName,
          message: JSON.stringify(output),
          retryCount: options?.retryCount,
          sentryClient,
        });
        sentryClient?.metricsAggregator?.add(
          "c",
          "upload_bundle_stats.success",
          1,
        );
      } catch {
        sentryClient?.metricsAggregator?.add(
          "c",
          "upload_bundle_stats.error",
          1,
        );
        return;
      } finally {
        sentryClient?.metricsAggregator?.add(
          "d",
          "upload_bundle_stats",
          Date.now() - uploadStart,
          "millisecond",
        );
      }
    },
  };
};
