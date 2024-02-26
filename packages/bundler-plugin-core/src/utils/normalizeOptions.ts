import { InvalidBundleNameError } from "../errors/InvalidBundleNameError.ts";
import { type Options } from "../types.ts";

export type NormalizedOptions = ReturnType<typeof normalizeOptions>;

const validBundleName = /^[\w\d_:/@\.{}\[\]$-]+$/;

export const normalizeOptions = (userOptions: Options) => {
  let bundleName;
  if (userOptions?.bundleName) {
    if (!validBundleName.test(userOptions.bundleName)) {
      throw new InvalidBundleNameError(
        `The bundleName "${userOptions.bundleName}" is invalid. It must match the pattern ${validBundleName}`,
      );
    }
    bundleName = userOptions.bundleName;
  }

  const options = {
    ...userOptions,
    bundleName: bundleName,
    apiUrl: userOptions.apiUrl ?? "https://api.codecov.io",
    dryRun: userOptions.dryRun ?? false,
  };

  return options;
};
