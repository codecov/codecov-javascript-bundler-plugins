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
import { debug } from "../utils/logging.ts";

interface BundleAnalysisUploadPluginArgs {
  options: NormalizedOptions;
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
}

export const bundleAnalysisPluginFactory = ({
  options,
  bundleAnalysisUploadPlugin,
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

      const args: UploadOverrides = options.uploadOverrides ?? {};
      const envs = process.env;
      const inputs: ProviderUtilInputs = { envs, args };
      const provider = await detectProvider(inputs);

      if (options.debug) {
        debug(`Uploading stats for commit: ${provider.commit.slice(0, 7)}`);
      }

      let url = "";
      try {
        url = await getPreSignedURL({
          apiURL: options?.apiUrl ?? "https://api.codecov.io",
          uploadToken: options?.uploadToken,
          serviceParams: provider,
          retryCount: options?.retryCount,
        });
      } catch (error) {
        return;
      }

      try {
        await uploadStats({
          preSignedUrl: url,
          bundleName: output.bundleName,
          message: JSON.stringify(output),
          retryCount: options?.retryCount,
        });
      } catch {}
    },
  };
};
