import { getCompressedSize, normalizePath } from "@codecov/bundler-plugin-core";

interface CreateAssetOptions {
  fileName: string;
  source: Uint8Array | string;
  formatString: string;
}

export const createAsset = async ({
  source,
  fileName,
  formatString,
}: CreateAssetOptions) => {
  let size = 0;
  if (source instanceof Buffer) {
    size = source?.byteLength;
  } else {
    size = Buffer.from(source).byteLength;
  }

  const gzipSize = await getCompressedSize({
    fileName,
    code: source,
  });

  return {
    name: fileName,
    size: size,
    gzipSize: gzipSize,
    normalized: normalizePath(fileName, formatString),
  };
};
