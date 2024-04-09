import {
  type Output,
  type ProviderUtilInputs,
  type UploadOverrides,
} from "../types";
import { getPreSignedURL } from "./getPreSignedURL";
import { type NormalizedOptions } from "./normalizeOptions";
import { detectProvider } from "./provider";
import { uploadStats } from "./uploadStats";

interface WriteBundleFactoryArgs {
  options: NormalizedOptions;
  output: Output;
}

export const writeBundleFactory =
  ({ options, output }: WriteBundleFactoryArgs) =>
  async () => {
    // don't need to do anything here if dryRun is true
    if (options.dryRun) return;

    // don't need to do anything if the bundle name is not present or empty
    if (!options.bundleName || options.bundleName === "") return;

    const args: UploadOverrides = options.uploadOverrides ?? {};
    const envs = process.env;
    const inputs: ProviderUtilInputs = { envs, args };
    const provider = await detectProvider(inputs);

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
  };
