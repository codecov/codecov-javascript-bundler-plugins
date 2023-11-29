import { detectProvider } from "../utils/provider.ts";
import {
  type BundleAnalysisUploadPlugin,
  type Options,
  type Output,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "../types.ts";
import { type UnpluginOptions } from "unplugin";
import { debug } from "../utils/logging.ts";

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
    uploaderOverrides: userOptions?.uploaderOverrides,
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
      const args: UploadOverrides = userOptions.uploaderOverrides ?? {};
      const envs = process.env;
      const inputs: ProviderUtilInputs = { envs, args };
      const provider = await detectProvider(inputs);
      debug(`\nprovider: ${JSON.stringify(provider, null, 2)}`);
    },
  };
};
