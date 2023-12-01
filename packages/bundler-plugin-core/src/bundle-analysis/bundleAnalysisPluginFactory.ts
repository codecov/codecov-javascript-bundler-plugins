import { detectProvider } from "../utils/provider.ts";
import {
  type BundleAnalysisUploadPlugin,
  type Options,
  type Output,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "../types.ts";
import { type UnpluginOptions } from "unplugin";
import { getPreSignedURL } from "../utils/getPreSignedURL.ts";
import { uploadStats } from "../utils/uploadStats.ts";

interface BundleAnalysisUploadPluginArgs {
  userOptions: Options;
  bundleAnalysisUploadPlugin: BundleAnalysisUploadPlugin;
}

export const bundleAnalysisPluginFactory = ({
  userOptions,
  bundleAnalysisUploadPlugin,
}: BundleAnalysisUploadPluginArgs): UnpluginOptions => {
  // const dryRun = userOptions?.dryRun ?? false;
  const output: Output = {
    version: "1",
  };

  const { pluginVersion, version, ...pluginOpts } = bundleAnalysisUploadPlugin({
    output,
    userOptions,
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
      if (userOptions?.dryRun) return;

      const args: UploadOverrides = userOptions.uploaderOverrides ?? {};
      const envs = process.env;
      const inputs: ProviderUtilInputs = { envs, args };
      const provider = await detectProvider(inputs);

      let url = "";
      try {
        url = await getPreSignedURL({
          apiURL: userOptions?.apiUrl ?? "https://api.codecov.io",
          globalUploadToken: userOptions?.globalUploadToken,
          repoToken: userOptions?.repoToken,
          serviceParams: provider,
          retryCount: userOptions?.retryCount,
        });
      } catch (error) {
        return;
      }

      try {
        await uploadStats({
          preSignedUrl: url,
          message: JSON.stringify(output),
          retryCount: userOptions?.retryCount,
        });
      } catch {}
    },
  };
};
